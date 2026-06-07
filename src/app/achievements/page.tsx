"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ACHIEVEMENTS, unlockedSet } from "@/lib/achievements";
import { useI18n } from "@/components/I18nProvider";
import { localizeAchievement } from "@/lib/i18n/content";

export default function AchievementsPage() {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [have, setHave] = useState<Set<string>>(new Set());

  useEffect(() => setHave(unlockedSet()), []);

  const unlocked = ACHIEVEMENTS.filter((a) => have.has(a.id)).length;

  return (
    <main className="flex flex-1 flex-col gap-4 py-2">
      <header className="text-center">
        <div className="text-4xl">🏅</div>
        <h1 className="mt-2 text-2xl font-extrabold text-white">{t("st_ach")}</h1>
        <p className="mt-1 text-sm text-white/60">
          {t("ach_progress", { n: unlocked, m: ACHIEVEMENTS.length })}
        </p>
      </header>

      <ul className="flex flex-col gap-2">
        {ACHIEVEMENTS.map((a) => {
          const on = have.has(a.id);
          const la = localizeAchievement(a, lang);
          return (
            <li
              key={a.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                on
                  ? "border-yellow-300/40 bg-yellow-300/10"
                  : "border-white/10 bg-white/[0.03] opacity-70"
              }`}
            >
              <span className={`text-2xl ${on ? "" : "grayscale"}`}>{a.icon}</span>
              <span className="min-w-0">
                <span className="block font-semibold text-white">{la.name}</span>
                <span className="block text-xs text-white/50">{la.desc}</span>
              </span>
              <span className="ml-auto text-sm">{on ? "✓" : "🔒"}</span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => router.push("/")}
        className="mt-auto pt-2 text-center text-xs text-white/40 hover:text-white/70"
      >
        ← {t("b_back")}
      </button>
    </main>
  );
}
