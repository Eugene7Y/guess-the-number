"use client";

import type { Achievement } from "@/lib/achievements";
import { useI18n } from "./I18nProvider";
import { localizeAchievement, localizeChallenge } from "@/lib/i18n/content";

export default function EndExtras({
  newly,
  challenge,
  onReroll,
}: {
  newly: Achievement[];
  challenge: string | null;
  onReroll?: () => void;
}) {
  const { lang, t } = useI18n();
  if (newly.length === 0 && !challenge) return null;
  return (
    <div className="mt-5 w-full max-w-xs space-y-2">
      {newly.map((a) => (
        <div
          key={a.id}
          className="animate-pop rounded-xl border border-yellow-300/50 bg-black/20 px-3 py-2 text-left text-white"
        >
          <div className="text-xs font-bold uppercase tracking-wide text-yellow-200">
            🎉 {t("ee_unlocked")}
          </div>
          <div className="text-sm font-semibold">
            {a.icon} {localizeAchievement(a, lang).name}
          </div>
          <div className="text-xs text-white/80">{localizeAchievement(a, lang).desc}</div>
        </div>
      ))}
      {challenge && (
        <div className="animate-pop rounded-xl border border-white/30 bg-black/20 px-3 py-3 text-center text-white">
          <div className="text-xs font-bold uppercase tracking-wide text-pink-200">
            💞 {t("ee_couple")}
          </div>
          <div className="mt-1 text-base font-semibold">{localizeChallenge(challenge, lang)}</div>
          {onReroll && (
            <button
              onClick={onReroll}
              className="mt-2 rounded-lg border border-white/30 px-3 py-1 text-xs font-semibold text-white/90 active:scale-95"
            >
              🎲 {t("ee_reroll")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
