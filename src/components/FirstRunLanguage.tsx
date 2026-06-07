"use client";

import { LOCALES } from "@/lib/i18n";
import { detectLang } from "@/lib/i18n/locales";
import { useI18n } from "./I18nProvider";
import LanguagePicker from "./LanguagePicker";

/**
 * First-launch language chooser. Highlights the browser-detected language as a
 * one-tap suggestion, with the full list below. Closing persists the choice.
 */
export default function FirstRunLanguage({ onDone }: { onDone: () => void }) {
  const { setLang, t } = useI18n();
  const suggested = LOCALES.find((l) => l.code === detectLang()) ?? LOCALES[0];

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/80 px-6 backdrop-blur">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b1020] p-6 animate-pop">
        <div className="text-center">
          <div className="text-4xl">🌍</div>
          <h2 className="mt-2 text-xl font-extrabold text-white">{t("lang_title")}</h2>
          <p className="mt-1 text-sm text-white/60">{t("lang_sub")}</p>
        </div>

        <button
          onClick={() => {
            setLang(suggested.code);
            onDone();
          }}
          className="mt-4 flex w-full items-center gap-3 rounded-xl border border-brand-500 bg-brand-600/20 px-4 py-3 text-left transition active:scale-[0.99]"
        >
          <span className="text-2xl">{suggested.flag}</span>
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wide text-brand-200">
              {t("lang_detected")}
            </span>
            <span className="block font-semibold text-white">
              {suggested.native} — {t("lang_use")}
            </span>
          </span>
        </button>

        <div className="my-4 h-px bg-white/10" />
        <LanguagePicker onPick={onDone} />
      </div>
    </div>
  );
}
