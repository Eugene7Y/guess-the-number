import { loadStats, type Stats } from "./stats";

export interface GameContext {
  won: boolean;
  guesses: number;
  durationMs: number;
  digits: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  /** satisfied given lifetime stats + the game that just finished */
  check: (s: Stats, ctx: GameContext) => boolean;
}

/** Optimal worst-case guesses (binary search) for a digit length. */
export function optimalGuesses(digits: number): number {
  const count = 9 * 10 ** (digits - 1);
  return Math.ceil(Math.log2(count));
}

// Expandable list — add new achievements here.
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-win", name: "First Win", desc: "Win your first game.", icon: "🥇",
    check: (s) => s.wins >= 1 },
  { id: "lucky-guess", name: "Lucky Guess", desc: "Win on your very first guess.", icon: "🍀",
    check: (_s, c) => c.won && c.guesses === 1 },
  { id: "perfect-game", name: "Perfect Game", desc: "Win in optimal guesses or fewer.", icon: "✨",
    check: (_s, c) => c.won && c.guesses <= optimalGuesses(c.digits) },
  { id: "speed-demon", name: "Speed Demon", desc: "Win a game in under 30 seconds.", icon: "⚡",
    check: (_s, c) => c.won && c.durationMs < 30000 },
  { id: "ten-wins", name: "10 Wins", desc: "Win 10 games.", icon: "🔟",
    check: (s) => s.wins >= 10 },
  { id: "comeback-king", name: "Comeback King", desc: "Reach a 5-win streak.", icon: "👑",
    check: (s) => s.bestStreak >= 5 },
  { id: "terminator", name: "Terminator", desc: "Win a 6-digit game in optimal guesses.", icon: "🤖",
    check: (_s, c) => c.won && c.digits === 6 && c.guesses <= optimalGuesses(6) },
  { id: "marathon", name: "Marathon", desc: "Play for a total of 1 hour.", icon: "⏳",
    check: (s) => s.totalPlayMs >= 3_600_000 },
  { id: "hundred-wins", name: "Centurion", desc: "Win 100 games.", icon: "💯",
    check: (s) => s.wins >= 100 },
  { id: "thousand-wins", name: "Legend", desc: "Win 1000 games.", icon: "🏆",
    check: (s) => s.wins >= 1000 },
];

const KEY = "gtn-achievements-v1";

export function unlockedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();
  }
}

/**
 * Evaluate after a finished game (call AFTER recordGame so stats are current).
 * Returns achievements newly unlocked by this game.
 */
export function evaluateAchievements(ctx: GameContext): Achievement[] {
  const s = loadStats();
  const have = unlockedSet();
  const newly: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!have.has(a.id) && a.check(s, ctx)) {
      have.add(a.id);
      newly.push(a);
    }
  }
  if (newly.length && typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify([...have]));
  }
  return newly;
}
