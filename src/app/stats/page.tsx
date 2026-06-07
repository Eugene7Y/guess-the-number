"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { averageGuesses, emptyStats, loadStats, resetStats, winRate, type Stats } from "@/lib/stats";
import { formatDuration } from "@/lib/gameLogic";
import { Button, Card } from "@/components/ui";
import { useT } from "@/components/I18nProvider";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-white/40">{label}</div>
    </div>
  );
}

export default function StatisticsPage() {
  const router = useRouter();
  const t = useT();
  const [s, setS] = useState<Stats>(emptyStats());
  const [confirm, setConfirm] = useState(false);

  useEffect(() => setS(loadStats()), []);

  return (
    <main className="flex flex-1 flex-col gap-4 py-2">
      <header className="text-center">
        <div className="text-4xl">📊</div>
        <h1 className="mt-2 text-2xl font-extrabold text-white">{t("stats_title")}</h1>
        <p className="mt-1 text-sm text-white/60">{t("stats_sub")}</p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Stat label={t("st_games")} value={String(s.games)} />
        <Stat label={t("st_wins")} value={String(s.wins)} />
        <Stat label={t("st_losses")} value={String(s.losses)} />
        <Stat label={t("st_winrate")} value={`${winRate(s)}%`} />
        <Stat label={t("st_avg")} value={String(averageGuesses(s))} />
        <Stat label={t("st_beststreak")} value={String(s.bestStreak)} />
        <Stat label={t("st_fastest")} value={s.fastestWinMs === null ? "—" : formatDuration(s.fastestWinMs)} />
        <Stat label={t("st_longest")} value={s.longestGameMs === null ? "—" : formatDuration(s.longestGameMs)} />
        <Stat label={t("st_streaknow")} value={String(s.currentStreak)} />
        <Stat label={t("st_closest")} value={s.closestGuess === null ? "—" : `±${s.closestGuess}`} />
        <Stat label={t("st_totalplay")} value={formatDuration(s.totalPlayMs)} />
      </div>

      {s.games === 0 && <Card className="text-center text-sm text-white/50">{t("st_empty")}</Card>}

      <button onClick={() => router.push("/achievements")} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition active:scale-[0.99]">
        <span className="font-semibold text-white">🏅 {t("st_ach")}</span>
        <span className="text-white/30">›</span>
      </button>
      <button onClick={() => router.push("/history")} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition active:scale-[0.99]">
        <span className="font-semibold text-white">📜 {t("st_history")}</span>
        <span className="text-white/30">›</span>
      </button>

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {confirm ? (
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => { resetStats(); setS(emptyStats()); setConfirm(false); }}>
              {t("st_confirm")}
            </Button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>✕</Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setConfirm(true)}>{t("st_reset")}</Button>
        )}
        <button onClick={() => router.push("/")} className="text-center text-xs text-white/40 hover:text-white/70">
          ← {t("b_back")}
        </button>
      </div>
    </main>
  );
}
