"use client";

import type { Guess, Player } from "@/lib/types";
import { useT } from "./I18nProvider";

function resultBadge(result: Guess["result"], t: ReturnType<typeof useT>) {
  switch (result) {
    case "higher":
      return (
        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-300">
          ↑ {t("res_higher")}
        </span>
      );
    case "lower":
      return (
        <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-xs font-bold text-sky-300">
          ↓ {t("res_lower")}
        </span>
      );
    case "correct":
      return (
        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
          ✓ {t("res_correct")}
        </span>
      );
  }
}

export default function GuessHistory({
  guesses,
  players,
  meId,
}: {
  guesses: Guess[];
  players: Player[];
  meId: string | null;
}) {
  const t = useT();
  if (guesses.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-white/40">
        {t("gh_empty")}
      </p>
    );
  }

  const nameFor = (id: string) =>
    players.find((p) => p.id === id)?.name ?? t("gh_player");

  // newest first
  const ordered = [...guesses].reverse();

  return (
    <ul className="flex flex-col gap-2">
      {ordered.map((g) => {
        const mine = g.player_id === meId;
        return (
          <li
            key={g.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-xs text-white/50">
                {mine ? t("gh_you") : nameFor(g.player_id)}
              </span>
              <span className="font-mono text-lg font-bold tracking-widest tabular-nums text-white">
                {g.guess}
              </span>
            </div>
            {resultBadge(g.result, t)}
          </li>
        );
      })}
    </ul>
  );
}
