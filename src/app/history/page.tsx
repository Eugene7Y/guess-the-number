"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearMatches, loadMatches, type MatchRecord } from "@/lib/history";
import { byId, MODES, AI_LEVELS } from "@/lib/gameContent";
import { formatDuration } from "@/lib/gameLogic";
import { useI18n } from "@/components/I18nProvider";
import { localizeEntry } from "@/lib/i18n/content";
import { Button, Card } from "@/components/ui";

function opponentLabel(o: string): string {
  if (o === "practice") return "🎯";
  return byId(AI_LEVELS, o)?.emoji ?? "🎮";
}

export default function HistoryPage() {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [rows, setRows] = useState<MatchRecord[]>([]);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => setRows(loadMatches()), []);

  return (
    <main className="flex flex-1 flex-col gap-4 py-2">
      <header className="text-center">
        <div className="text-4xl">📜</div>
        <h1 className="mt-2 text-2xl font-extrabold text-white">{t("hist_title")}</h1>
        <p className="mt-1 text-sm text-white/60">{t("hist_sub")}</p>
      </header>

      {rows.length === 0 ? (
        <Card className="text-center text-sm text-white/50">{t("hist_empty")}</Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((m) => (
            <li key={m.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span>{opponentLabel(m.opponent)}</span>
                  <span>{(() => { const e = byId(MODES, m.mode); return e ? localizeEntry(e, lang).name : m.mode; })()}</span>
                  <span className="text-white/30">· {m.digits}d</span>
                </span>
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${m.won ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                  {m.won ? t("res_win") : t("res_loss")}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-white/45">
                <span>{new Date(m.date).toLocaleDateString()} {new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span>{m.guesses} {t("guessesWord")}</span>
                <span>{formatDuration(m.durationMs)}</span>
                {m.rules.length > 0 && <span className="text-white/35">{m.rules.join(" · ")}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {rows.length > 0 &&
          (confirm ? (
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => { clearMatches(); setRows([]); setConfirm(false); }}>
                {t("hist_clear")}
              </Button>
              <Button variant="ghost" onClick={() => setConfirm(false)}>✕</Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setConfirm(true)}>{t("hist_clear")}</Button>
          ))}
        <button onClick={() => router.push("/")} className="text-center text-xs text-white/40 hover:text-white/70">
          ← {t("b_back")}
        </button>
      </div>
    </main>
  );
}
