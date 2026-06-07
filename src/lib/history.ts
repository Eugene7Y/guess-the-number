// Match history (per device, localStorage). Stores the fields requested in the
// roadmap and is structured so future fields (rating delta, season, etc.) add
// cleanly without breaking older records.

export interface MatchRecord {
  id: string;
  date: string; // ISO timestamp
  mode: string; // mode id (classic / hotcold / …)
  opponent: string; // "practice" | ai level | "human"
  won: boolean;
  guesses: number;
  durationMs: number;
  digits: number;
  rules: string[]; // special modifiers active
}

const KEY = "gtn-history-v1";
const MAX = 100;

export function loadMatches(): MatchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveMatch(rec: Omit<MatchRecord, "id" | "date">) {
  if (typeof window === "undefined") return;
  const list = loadMatches();
  list.unshift({ ...rec, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: new Date().toISOString() });
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function clearMatches() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}
