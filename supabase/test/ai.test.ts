// Tests for AI logic + Hot & Cold. Run:
//   node --experimental-strip-types supabase/test/ai.test.ts
import assert from "node:assert";
import { aiGuess, aiMovesFirst, hotCold, resultFor } from "../../src/lib/ai.ts";
import { resultFor as _r } from "../../src/lib/ai.ts";
import { boundsFor, type PastGuess } from "../../src/lib/gameLogic.ts";

let pass = 0;
const ok = (n: string, c: boolean) => {
  assert.ok(c, "FAIL: " + n);
  pass++;
  console.log("PASS", n);
};

// turn order
ok("impossible moves first", aiMovesFirst("impossible") === true);
ok("monster does not move first", aiMovesFirst("monster") === false);

// monster plays the perfect midpoint
ok("monster opens at midpoint (4-digit)", aiGuess("monster", 4, []) === "5499");
// after a 'higher' on 5499, range 5500..9999, mid 7749
const h: PastGuess[] = [{ guess: "5499", result: "higher" }];
ok("monster narrows up", aiGuess("monster", 4, h) === "7749");

// all levels produce valid in-range, correct-length guesses
for (const lvl of ["rookie", "human", "monster", "impossible"] as const) {
  for (let i = 0; i < 50; i++) {
    const g = aiGuess(lvl, 4, h);
    const n = parseInt(g, 10);
    assert.ok(g.length === 4, `len ${lvl}`);
    assert.ok(n >= boundsFor(4).low && n <= boundsFor(4).high, `range ${lvl} ${g}`);
  }
}
ok("all levels produce valid 4-digit guesses", true);

// a monster always solves within optimal worst-case (binary search terminates)
function simulate(secret: string): number {
  let hist: PastGuess[] = [];
  for (let i = 0; i < 40; i++) {
    const g = aiGuess("monster", 4, hist);
    const r = resultFor(secret, g);
    hist = [...hist, { guess: g, result: r }];
    if (r === "correct") return i + 1;
  }
  return 99;
}
ok("monster solves 1000 in <=14", simulate("1000") <= 14);
ok("monster solves 9999 in <=14", simulate("9999") <= 14);
ok("monster solves 4544 in <=14", simulate("4544") <= 14);

// hot & cold buckets (spec: secret 4544)
ok("hotcold correct", hotCold("4544", "4544", 4).key === "correct");
ok("hotcold very hot near", hotCold("4544", "4550", 4).key === "very-hot");
ok("hotcold very cold far", hotCold("4544", "9999", 4).key === "very-cold");

ok("resultFor higher", _r("4544", "3000") === "higher");
ok("resultFor lower", _r("4544", "6000") === "lower");

console.log(`\nRESULT ${pass} passed`);
