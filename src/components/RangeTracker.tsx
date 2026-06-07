"use client";

import type { PastGuess } from "@/lib/gameLogic";
import { computeRange } from "@/lib/gameLogic";

export default function RangeTracker({
  digits,
  history,
}: {
  digits: number;
  history: PastGuess[];
}) {
  const { low, high } = computeRange(digits, history);
  const remaining = Math.max(0, high - low + 1);
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-center">
      <div className="text-[11px] uppercase tracking-wide text-sky-200/70">
        Current possible range
      </div>
      <div className="mt-1 font-mono text-xl font-bold tabular-nums text-sky-100">
        {low.toLocaleString()} – {high.toLocaleString()}
      </div>
      <div className="mt-0.5 text-xs text-sky-200/60">
        {remaining.toLocaleString()} possibilities left
      </div>
    </div>
  );
}
