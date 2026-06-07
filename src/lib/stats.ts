// Per-device statistics, stored in localStorage (no account needed).
// Records outcomes from both single-player and multiplayer games.

export interface Stats {
  games: number;
  wins: number;
  losses: number;
  totalWinGuesses: number; // sum of guesses across wins (for average)
  fastestWinMs: number | null;
  longestGameMs: number | null;
  bestStreak: number;
  currentStreak: number;
  closestGuess: number | null; // smallest distance to a secret you got (lower is better)
  totalPlayMs: number; // total time spent across all games
}

export interface BestRecord {
  bestGuesses: number;
  bestTimeMs: number;
}

const STATS_KEY = "gtn-stats-v1";
const BEST_KEY = "gtn-best-v1";

export function emptyStats(): Stats {
  return {
    games: 0,
    wins: 0,
    losses: 0,
    totalWinGuesses: 0,
    fastestWinMs: null,
    longestGameMs: null,
    bestStreak: 0,
    currentStreak: 0,
    closestGuess: null,
    totalPlayMs: 0,
  };
}

export function loadStats(): Stats {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return emptyStats();
    return { ...emptyStats(), ...JSON.parse(raw) };
  } catch {
    return emptyStats();
  }
}

function saveStats(s: Stats) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATS_KEY, JSON.stringify(s));
}

/** Record a finished game. Returns the updated stats. */
export function recordGame(opts: {
  won: boolean;
  guesses: number;
  durationMs: number;
  closestGuess?: number; // smallest distance achieved this game (optional)
}): Stats {
  const s = loadStats();
  s.games += 1;
  s.longestGameMs = Math.max(s.longestGameMs ?? 0, opts.durationMs);
  s.totalPlayMs += Math.max(0, opts.durationMs);
  if (opts.closestGuess !== undefined && opts.closestGuess >= 0) {
    s.closestGuess =
      s.closestGuess === null ? opts.closestGuess : Math.min(s.closestGuess, opts.closestGuess);
  }
  if (opts.won) {
    s.wins += 1;
    s.totalWinGuesses += opts.guesses;
    s.currentStreak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.currentStreak);
    s.fastestWinMs =
      s.fastestWinMs === null
        ? opts.durationMs
        : Math.min(s.fastestWinMs, opts.durationMs);
  } else {
    s.losses += 1;
    s.currentStreak = 0;
  }
  saveStats(s);
  return s;
}

export function resetStats() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STATS_KEY);
  window.localStorage.removeItem(BEST_KEY);
}

export function winRate(s: Stats): number {
  return s.games === 0 ? 0 : Math.round((s.wins / s.games) * 100);
}

export function averageGuesses(s: Stats): number {
  return s.wins === 0 ? 0 : Math.round((s.totalWinGuesses / s.wins) * 10) / 10;
}

// ---- Personal best per single-player configuration ----

function loadBest(): Record<string, BestRecord> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getBest(key: string): BestRecord | null {
  return loadBest()[key] ?? null;
}

/** Update the personal best for a config key. Returns true if a record was beaten. */
export function recordBest(
  key: string,
  guesses: number,
  timeMs: number
): { best: BestRecord; improved: boolean } {
  const all = loadBest();
  const prev = all[key];
  let improved = false;
  const next: BestRecord = {
    bestGuesses: prev ? Math.min(prev.bestGuesses, guesses) : guesses,
    bestTimeMs: prev ? Math.min(prev.bestTimeMs, timeMs) : timeMs,
  };
  if (!prev || next.bestGuesses < prev.bestGuesses || next.bestTimeMs < prev.bestTimeMs) {
    improved = true;
  }
  all[key] = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(all));
  }
  return { best: next, improved };
}
