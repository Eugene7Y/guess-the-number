"use client";

import { useState } from "react";
import type { InfoEntry } from "@/lib/gameContent";
import { useI18n } from "@/components/I18nProvider";
import { localizeEntry, localizeDifficulty } from "@/lib/i18n/content";

/** Full details for an entry (used in the encyclopedia and expanded panels). */
export function InfoBody({ entry }: { entry: InfoEntry }) {
  const { lang, t } = useI18n();
  const e = localizeEntry(entry, lang);
  return (
    <div className="space-y-2 text-sm">
      <p className="text-white/80">{e.detailed}</p>
      <p className="rounded-lg bg-white/5 px-3 py-2 text-white/70">
        <span className="font-semibold text-white/80">{t("ip_example")}: </span>
        {e.example}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-300/80">
            {t("ip_adv")}
          </div>
          <ul className="mt-1 list-disc pl-4 text-white/70">
            {e.advantages.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-red-300/80">
            {t("ip_dis")}
          </div>
          <ul className="mt-1 list-disc pl-4 text-white/70">
            {e.disadvantages.length ? (
              e.disadvantages.map((d, i) => <li key={i}>{d}</li>)
            ) : (
              <li className="list-none text-white/40">—</li>
            )}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
        {e.bestFor && (
          <span>
            <span className="text-white/40">{t("ip_bestfor")}:</span> {e.bestFor}
          </span>
        )}
        {e.difficulty && (
          <span>
            <span className="text-white/40">{t("ip_difficulty")}:</span>{" "}
            {localizeDifficulty(e.difficulty, lang)}
          </span>
        )}
        {e.length && (
          <span>
            <span className="text-white/40">{t("ip_length")}:</span> {e.length}
          </span>
        )}
      </div>
    </div>
  );
}

/** Collapsible info panel shown under a selected option. */
export default function InfoPanel({
  entry,
  defaultOpen = false,
}: {
  entry: InfoEntry;
  defaultOpen?: boolean;
}) {
  const { lang, t } = useI18n();
  const e = localizeEntry(entry, lang);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <span className="text-lg">{e.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white">{e.name}</span>
          <span className="block truncate text-xs text-white/50">{e.short}</span>
        </span>
        <span className="text-xs text-white/40">{open ? `${t("ip_hide")} ▲` : `${t("ip_info")} ▼`}</span>
      </button>
      {open && (
        <div className="border-t border-white/10 px-3 py-3">
          <InfoBody entry={entry} />
        </div>
      )}
    </div>
  );
}
