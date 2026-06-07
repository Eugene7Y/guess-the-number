"use client";

import { LOCALES } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

export default function LanguagePicker({ onPick }: { onPick?: () => void }) {
  const { lang, setLang } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-2">
      {LOCALES.map((l) => {
        const on = l.code === lang;
        return (
          <button
            key={l.code}
            onClick={() => {
              setLang(l.code);
              onPick?.();
            }}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
              on ? "border-brand-500 bg-brand-500/15" : "border-white/10 bg-white/5"
            }`}
          >
            <span className="text-2xl">{l.flag}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{l.native}</span>
              <span className="block truncate text-xs text-white/40">{l.name}</span>
            </span>
            {on && <span className="ml-auto text-brand-400">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
