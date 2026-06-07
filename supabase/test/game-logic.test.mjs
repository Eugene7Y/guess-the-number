/**
 * End-to-end test of the database game logic, the privacy model, and security.
 *
 * Spins up a throwaway local PostgreSQL (via `embedded-postgres`), loads the
 * real `supabase/schema.sql`, shims the two Supabase-only bits (`auth.uid()`
 * and the `anon`/`authenticated` roles), then plays full games and asserts
 * every rule — including that a client role can read ONLY its own guesses and
 * its own (non-hidden) secret, never the opponent's.
 *
 * Run:
 *   npm install --no-save embedded-postgres pg
 *   node supabase/test/game-logic.test.mjs
 */
import EmbeddedPostgres from "embedded-postgres";
import pgpkg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const { Client } = pgpkg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "..", "schema.sql");

const U1 = "11111111-1111-1111-1111-111111111111"; // Player 1 (host)
const U2 = "22222222-2222-2222-2222-222222222222"; // Player 2

let pass = 0, fail = 0;
function ok(name, cond, extra = "") {
  if (cond) { pass++; console.log("PASS", name, extra); }
  else { fail++; console.log("FAIL", name, extra); }
}

const pg = new EmbeddedPostgres({
  databaseDir: "/tmp/gtn-pgdata2", user: "postgres", password: "postgres",
  port: 5434, persistent: false,
});
await pg.initialise();
await pg.start();
const c = new Client({ host: "localhost", port: 5434, user: "postgres", password: "postgres", database: "postgres" });
await c.connect();

await c.query(`create schema if not exists auth;`);
await c.query(`create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('app.uid', true), '')::uuid $$;`);
await c.query(`do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
end $$;`);
await c.query(readFileSync(SCHEMA_PATH, "utf8"));
console.log("SCHEMA LOADED");

const setUid = (u) => c.query(`select set_config('app.uid', $1, false)`, [u]);
const rpc = async (sql, params = []) => (await c.query(sql, params)).rows;

try {
  // ===== Room A: manual secrets, gameplay + privacy =====
  await setUid(U1);
  const code = (await rpc(`select create_room('Alice') as code`))[0].code;
  await setUid(U2); await rpc(`select join_room($1,'Bob')`, [code]);
  await setUid(U1); await rpc(`select set_digits($1,4)`, [code]);

  await setUid(U1); await rpc(`select submit_secret($1,'1234')`, [code]);
  await setUid(U2); await rpc(`select submit_secret($1,'4544')`, [code]);
  let room = (await rpc(`select * from rooms where id=$1`, [code]))[0];
  ok("both submitted -> playing", room.status === "playing");
  ok("manual submit sets secret_hidden=false",
    (await rpc(`select bool_or(secret_hidden) h from players where room_id=$1`, [code]))[0].h === false);

  const p1 = (await rpc(`select id from players where room_id=$1 and is_host`, [code]))[0].id;
  const p2 = (await rpc(`select id from players where room_id=$1 and not is_host`, [code]))[0].id;

  // Play a few turns (U1 guesses 4544, U2 guesses 1234)
  await setUid(U1); let r = (await rpc(`select make_guess($1,'3000') as r`, [code]))[0].r;
  ok("U1 3000 vs 4544 -> higher", r === "higher", r);
  await setUid(U2); r = (await rpc(`select make_guess($1,'9000') as r`, [code]))[0].r;
  ok("U2 9000 vs 1234 -> lower", r === "lower", r);
  await setUid(U1); r = (await rpc(`select make_guess($1,'5000') as r`, [code]))[0].r;
  ok("U1 5000 vs 4544 -> lower", r === "lower", r);
  // Now U1 has 2 guesses, U2 has 1 guess.

  // ----- PRIVACY: as the authenticated client role, RLS must hide opponent rows -----
  await c.query(`set role authenticated`);
  await setUid(U1);
  let mine = await rpc(`select count(*)::int n from guesses where room_id=$1`, [code]);
  ok("U1 sees only own guesses via RLS (2)", mine[0].n === 2, "n=" + mine[0].n);
  let oppRows = await rpc(`select count(*)::int n from guesses where room_id=$1 and player_id=$2`, [code, p2]);
  ok("U1 CANNOT read U2's guess rows (0)", oppRows[0].n === 0, "n=" + oppRows[0].n);

  await setUid(U2);
  mine = await rpc(`select count(*)::int n from guesses where room_id=$1`, [code]);
  ok("U2 sees only own guesses via RLS (1)", mine[0].n === 1, "n=" + mine[0].n);

  // secrets unreadable directly even with RLS role
  let leaked = false, denied = false;
  try {
    const rows = await rpc(`select secret from player_secrets where room_id=$1`, [code]);
    leaked = rows.length > 0;
  } catch (e) { denied = /permission denied/i.test(e.message); }
  ok("secrets table not readable by client", !leaked, denied ? "(permission denied)" : "(0 rows)");
  await c.query(`reset role`);

  // ----- masked opponent progress (count only) -----
  await setUid(U1);
  ok("U1 sees opponent made 1 guess", (await rpc(`select get_opponent_progress($1) n`, [code]))[0].n === 1);
  await setUid(U2);
  ok("U2 sees opponent made 2 guesses", (await rpc(`select get_opponent_progress($1) n`, [code]))[0].n === 2);

  // ----- own secret reveal (manual => visible) -----
  await setUid(U1);
  ok("U1 reveal_my_secret = 1234", (await rpc(`select reveal_my_secret($1) s`, [code]))[0].s === "1234");
  await setUid(U2);
  ok("U2 reveal_my_secret = 4544", (await rpc(`select reveal_my_secret($1) s`, [code]))[0].s === "4544");

  // ----- finish + winner -----
  await setUid(U2); await rpc(`select make_guess($1,'2000') as r`, [code]); // U2 guess (wrong), turn -> U1
  await setUid(U1); r = (await rpc(`select make_guess($1,'4544') as r`, [code]))[0].r;
  ok("U1 4544 -> correct", r === "correct", r);
  room = (await rpc(`select * from rooms where id=$1`, [code]))[0];
  ok("finished, winner = U1", room.status === "finished" && room.winner === p1);

  // ----- RESET clears everything incl. hidden state -----
  await setUid(U1); await rpc(`select rematch($1)`, [code]);
  room = (await rpc(`select * from rooms where id=$1`, [code]))[0];
  const g = (await rpc(`select count(*)::int n from guesses where room_id=$1`, [code]))[0].n;
  const s = (await rpc(`select count(*)::int n from player_secrets where room_id=$1`, [code]))[0].n;
  const subs = (await rpc(`select count(*)::int n from players where room_id=$1 and has_submitted`, [code]))[0].n;
  const hid = (await rpc(`select count(*)::int n from players where room_id=$1 and secret_hidden`, [code]))[0].n;
  ok("reset -> setup", room.status === "setup");
  ok("reset clears winner", room.winner === null);
  ok("reset clears guesses", g === 0);
  ok("reset clears secrets", s === 0);
  ok("reset clears has_submitted", subs === 0);
  ok("reset clears secret_hidden", hid === 0);

  // ===== Room B: random secrets (reveal + hidden) =====
  await setUid(U1);
  const codeB = (await rpc(`select create_room('Carl') as code`))[0].code;
  await setUid(U2); await rpc(`select join_room($1,'Dana')`, [codeB]);
  await setUid(U1); await rpc(`select set_digits($1,5)`, [codeB]);

  await setUid(U1);
  const shown = (await rpc(`select submit_random_secret($1, true) s`, [codeB]))[0].s;
  ok("random&show returns a value", typeof shown === "string");
  ok("random 5-digit length", shown && shown.length === 5, shown);
  ok("random 5-digit in range 10000-99999", Number(shown) >= 10000 && Number(shown) <= 99999, shown);
  ok("U1 not hidden after show", (await rpc(`select secret_hidden h from players where room_id=$1 and is_host`, [codeB]))[0].h === false);
  ok("U1 reveal_my_secret == shown", (await rpc(`select reveal_my_secret($1) s`, [codeB]))[0].s === shown);

  await setUid(U2);
  const hidden = (await rpc(`select submit_random_secret($1, false) s`, [codeB]))[0].s;
  ok("random&hidden returns null to player", hidden === null);
  ok("U2 hidden flag set", (await rpc(`select secret_hidden h from players where room_id=$1 and not is_host`, [codeB]))[0].h === true);
  ok("U2 reveal_my_secret == null (blind)", (await rpc(`select reveal_my_secret($1) s`, [codeB]))[0].s === null);
  // but a hidden secret IS actually stored (game can be played)
  ok("hidden secret stored server-side", (await rpc(`select count(*)::int n from player_secrets where room_id=$1`, [codeB]))[0].n === 2);
  ok("random game auto-started", (await rpc(`select status from rooms where id=$1`, [codeB]))[0].status === "playing");

  // ===== Room C: 3-digit random range =====
  await setUid(U1);
  const codeC = (await rpc(`select create_room('Eve') as code`))[0].code;
  await setUid(U2); await rpc(`select join_room($1,'Finn')`, [codeC]);
  await setUid(U1); await rpc(`select set_digits($1,3)`, [codeC]);
  const three = (await rpc(`select submit_random_secret($1, true) s`, [codeC]))[0].s;
  ok("random 3-digit in range 100-999", three && three.length === 3 && Number(three) >= 100 && Number(three) <= 999, three);

  // ===== Room D: settings, turn timer, hints, skip =====
  await setUid(U1);
  const codeD = (await rpc(`select create_room('Gwen') as code`))[0].code;
  await setUid(U2); await rpc(`select join_room($1,'Hugo')`, [codeD]);
  // non-host cannot change settings
  let threwD = false;
  try { await rpc(`select set_room_settings($1,4,30,true,true,true,true)`, [codeD]); } catch { threwD = true; }
  ok("non-host cannot set_room_settings", threwD);
  // host sets settings
  await setUid(U1);
  await rpc(`select set_room_settings($1,4,30,true,true,true,true)`, [codeD]);
  let rd = (await rpc(`select * from rooms where id=$1`, [codeD]))[0];
  ok("settings applied (digits/timer/hints)", rd.digits === 4 && rd.turn_seconds === 30 && rd.allow_hints === true);

  // submit manual secrets: U1=4544, U2=1234
  await setUid(U1); await rpc(`select submit_secret($1,'4544')`, [codeD]);
  await setUid(U2); await rpc(`select submit_secret($1,'1234')`, [codeD]);
  rd = (await rpc(`select * from rooms where id=$1`, [codeD]))[0];
  ok("playing sets started_at", rd.status === "playing" && rd.started_at !== null);
  ok("timer sets turn_deadline", rd.turn_deadline !== null);

  // get_hint requires a prior guess
  await setUid(U1);
  let threwH = false;
  try { await rpc(`select get_hint($1,0)`, [codeD]); } catch { threwH = true; }
  ok("hint blocked before any guess", threwH);
  // U1 guesses U2 secret (1234): 5000 -> lower
  let rr = (await rpc(`select make_guess($1,'5000') as r`, [codeD]))[0].r;
  ok("U1 5000 vs 1234 -> lower", rr === "lower", rr);
  // now hint available (turn passed to U2; but get_hint uses caller's own guesses, U1 still can ask)
  const hint0 = (await rpc(`select get_hint($1,0) h`, [codeD]))[0].h;
  ok("hint returns text", typeof hint0 === "string" && hint0.includes("/"), hint0);

  // skip_turn: it's U2's turn now; U2 voluntarily passes -> back to U1
  const pD1 = (await rpc(`select id from players where room_id=$1 and is_host`, [codeD]))[0].id;
  await setUid(U2); await rpc(`select skip_turn($1)`, [codeD]);
  rd = (await rpc(`select turn from rooms where id=$1`, [codeD]))[0];
  ok("skip_turn passes turn back to U1", rd.turn === pD1);

  // hints disabled elsewhere -> error
  await setUid(U1);
  const codeE = (await rpc(`select create_room('Ivy') as code`))[0].code;
  await setUid(U2); await rpc(`select join_room($1,'Jon')`, [codeE]);
  await setUid(U1); await rpc(`select set_room_settings($1,4,0,true,true,false,true)`, [codeE]);
  await rpc(`select submit_secret($1,'1111')`, [codeE]);
  await setUid(U2); await rpc(`select submit_secret($1,'2222')`, [codeE]);
  await setUid(U1); await rpc(`select make_guess($1,'3333')`, [codeE]);
  let threwHD = false;
  try { await rpc(`select get_hint($1,0)`, [codeE]); } catch { threwHD = true; }
  ok("hint disabled -> error", threwHD);

} catch (e) {
  fail++; console.log("FAIL exception", e.message);
}

console.log(`\nRESULT ${pass} passed, ${fail} failed`);
await c.end();
await pg.stop();
process.exit(fail === 0 ? 0 : 1);
