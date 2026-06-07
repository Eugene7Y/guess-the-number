// Unit tests for the pure game logic. Run with Node's type stripping:
//   node --experimental-strip-types supabase/test/gamelogic.test.ts
import assert from "node:assert";
import {
  boundsFor,
  generateSecret,
  compareGuess,
  computeRange,
  makeHint,
  formatDuration,
} from "../../src/lib/gameLogic.ts";

let pass = 0;
const ok = (name: string, cond: boolean) => {
  assert.ok(cond, "FAIL: " + name);
  pass++;
  console.log("PASS", name);
};

// bounds
ok("bounds 3 = 100..999", boundsFor(3).low === 100 && boundsFor(3).high === 999);
ok("bounds 6 = 100000..999999", boundsFor(6).low === 100000 && boundsFor(6).high === 999999);

// generateSecret respects length & range
for (const d of [3, 4, 5, 6]) {
  const s = generateSecret(d);
  ok(`gen ${d}-digit length`, s.length === d);
  const n = parseInt(s, 10);
  ok(`gen ${d}-digit range`, n >= boundsFor(d).low && n <= boundsFor(d).high);
}

// compareGuess (spec example: secret 4544)
ok("4544 vs 3000 -> higher", compareGuess("4544", "3000") === "higher");
ok("4544 vs 6000 -> lower", compareGuess("4544", "6000") === "lower");
ok("4544 vs 4544 -> correct", compareGuess("4544", "4544") === "correct");

// range tracker (spec example for 4 digits)
let r = computeRange(4, [{ guess: "3000", result: "higher" }]);
ok("range after higher 3000 = 3001..9999", r.low === 3001 && r.high === 9999);
r = computeRange(4, [
  { guess: "3000", result: "higher" },
  { guess: "6000", result: "lower" },
]);
ok("range after lower 6000 = 3001..5999", r.low === 3001 && r.high === 5999);
r = computeRange(4, [{ guess: "4544", result: "correct" }]);
ok("range after correct collapses", r.low === 4544 && r.high === 4544);

// hints don't reveal the full number but are correct
const range = computeRange(4, []);
ok("hint parity even (4544)", makeHint("4544", range, 1).includes("EVEN"));
ok("hint half lower (4544)", makeHint("4544", range, 0).includes("LOWER"));
ok("hint first digit (4544)", makeHint("4544", range, 2).includes("4"));

// duration formatting
ok("format 5s", formatDuration(5000) === "5s");
ok("format 1m 5s", formatDuration(65000) === "1m 5s");

console.log(`\nRESULT ${pass} passed`);
