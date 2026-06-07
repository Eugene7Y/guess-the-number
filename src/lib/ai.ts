// Pure AI opponent logic and Hot & Cold feedback. No DOM/network — unit-testable.
import { boundsFor, type GuessResult, type PastGuess, type Range, computeRange } from "./gameLogic";

export type AiLevel = "rookie" | "human" | "monster" | "impossible";

/** Does this AI level take the first turn? Only "impossible" does. */
export function aiMovesFirst(level: AiLevel): boolean {
  return level === "impossible";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Produce the AI's next guess (as a digit-padded string) against the player's
 * secret, given the AI's own guess history and the digit length.
 */
export function aiGuess(
  level: AiLevel,
  digits: number,
  history: PastGuess[]
): string {
  const full = boundsFor(digits);
  const { low, high }: Range = computeRange(digits, history);
  const span = high - low;
  let n: number;

  switch (level) {
    case "monster":
    case "impossible":
      n = Math.floor((low + high) / 2); // perfect binary search
      break;
    case "human": {
      // near the midpoint, with human imprecision (±~20% of the span)
      const mid = (low + high) / 2;
      const jitter = (Math.random() - 0.5) * span * 0.4;
      n = Math.round(mid + jitter);
      break;
    }
    case "rookie":
    default: {
      if (Math.random() < 0.4) {
        // wastes a move: random across the whole space (often outside feasible)
        n = full.low + Math.floor(Math.random() * (full.high - full.low + 1));
      } else {
        // random within the feasible range (slow but eventually narrows)
        n = low + Math.floor(Math.random() * (span + 1));
      }
      break;
    }
  }

  n = clamp(n, full.low, full.high);
  return String(n).padStart(digits, "0").slice(-digits);
}

export type HotCold = "very-hot" | "hot" | "close" | "cold" | "very-cold" | "correct";

export interface HotColdInfo {
  key: HotCold;
  emoji: string;
  label: string; // bilingual EN / UA
}

/** Distance-based feedback for Hot & Cold mode. */
export function hotCold(secret: string, guess: string, digits: number): HotColdInfo {
  const s = parseInt(secret, 10);
  const g = parseInt(guess, 10);
  if (s === g) return { key: "correct", emoji: "🎯", label: "CORRECT / ПРАВИЛЬНО" };
  const { low, high } = boundsFor(digits);
  const ratio = Math.abs(s - g) / (high - low);
  if (ratio < 0.02) return { key: "very-hot", emoji: "🔥", label: "Very Hot / Дуже гаряче" };
  if (ratio < 0.06) return { key: "hot", emoji: "🌡", label: "Hot / Гаряче" };
  if (ratio < 0.15) return { key: "close", emoji: "🙂", label: "Close / Близько" };
  if (ratio < 0.35) return { key: "cold", emoji: "🥶", label: "Cold / Холодно" };
  return { key: "very-cold", emoji: "❄", label: "Very Cold / Дуже холодно" };
}

/** Direction-style result (used internally so the AI can always binary-search). */
export function resultFor(secret: string, guess: string): GuessResult {
  const s = parseInt(secret, 10);
  const g = parseInt(guess, 10);
  if (s === g) return "correct";
  return s > g ? "higher" : "lower";
}
