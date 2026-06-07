// Pure game logic shared by single-player and multiplayer.
// No DOM / no network here, so it can be unit-tested directly with Node.

export type GuessResult = "higher" | "lower" | "correct";

export interface PastGuess {
  guess: string;
  result: GuessResult;
}

export interface Range {
  low: number;
  high: number;
}

/** Inclusive numeric bounds for a given digit length (no leading zeros). */
export function boundsFor(digits: number): Range {
  return { low: 10 ** (digits - 1), high: 10 ** digits - 1 };
}

/** Generate a random secret of `digits` length (e.g. 4 -> 1000..9999). */
export function generateSecret(digits: number): string {
  const { low, high } = boundsFor(digits);
  const n = low + Math.floor(Math.random() * (high - low + 1));
  return String(n);
}

/** Compare a guess to the secret. Returns what the guesser should be told. */
export function compareGuess(secret: string, guess: string): GuessResult {
  const s = parseInt(secret, 10);
  const g = parseInt(guess, 10);
  if (g === s) return "correct";
  return s > g ? "higher" : "lower";
}

/**
 * Narrow the feasible range from a history of guesses+results.
 * higher => secret > guess; lower => secret < guess.
 */
export function computeRange(digits: number, history: PastGuess[]): Range {
  let { low, high } = boundsFor(digits);
  for (const { guess, result } of history) {
    const g = parseInt(guess, 10);
    if (result === "higher") low = Math.max(low, g + 1);
    else if (result === "lower") high = Math.min(high, g - 1);
    else if (result === "correct") return { low: g, high: g };
  }
  return { low, high };
}

export type HintKind = "half" | "parity" | "digit";

/** Order in which hints are revealed as the player asks for more. */
export function hintKindForIndex(index: number): HintKind {
  const order: HintKind[] = ["half", "parity", "digit"];
  return order[Math.min(index, order.length - 1)];
}

/** Translation keys produced by makeHint (a subset of the i18n dictionary). */
export type HintKey = "hint_even" | "hint_odd" | "hint_lower" | "hint_upper" | "hint_digit";
type HintTranslate = (key: HintKey, vars?: Record<string, string | number>) => string;

/**
 * Produce a single localized hint string about `secret` without revealing the
 * whole number. `index` escalates the hint type; `range` is the current
 * feasible range (used for the "half" hint). The translator `t` is injected so
 * this module stays free of any i18n dependency.
 */
export function makeHint(
  secret: string,
  range: Range,
  index: number,
  t: HintTranslate
): string {
  const kind = hintKindForIndex(index);
  const s = parseInt(secret, 10);
  if (kind === "parity") {
    return s % 2 === 0 ? t("hint_even") : t("hint_odd");
  }
  if (kind === "half") {
    const mid = Math.floor((range.low + range.high) / 2);
    return s <= mid
      ? t("hint_lower", { low: range.low, high: mid })
      : t("hint_upper", { low: mid + 1, high: range.high });
  }
  // digit: reveal the first digit's value
  return t("hint_digit", { v: secret[0] });
}

export const DIGIT_OPTIONS = [3, 4, 5, 6] as const;
export type Difficulty = "easy" | "normal" | "hard" | "nightmare";

export interface DifficultyConfig {
  key: Difficulty;
  label: string;
  blurb: string;
  tracker: boolean; // range tracker available
  hints: boolean; // hint button available
  liveStats: boolean; // show guess count / timer during play
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    key: "easy",
    label: "Easy",
    blurb: "Range tracker on, hints available.",
    tracker: true,
    hints: true,
    liveStats: true,
  },
  normal: {
    key: "normal",
    label: "Normal",
    blurb: "Standard play. Range tracker on.",
    tracker: true,
    hints: false,
    liveStats: true,
  },
  hard: {
    key: "hard",
    label: "Hard",
    blurb: "No tracker, no hints.",
    tracker: false,
    hints: false,
    liveStats: true,
  },
  nightmare: {
    key: "nightmare",
    label: "Nightmare",
    blurb: "No tracker, no hints, no stats until you win.",
    tracker: false,
    hints: false,
    liveStats: false,
  },
};

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
