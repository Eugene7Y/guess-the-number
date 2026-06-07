"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { ErrorBanner } from "@/components/ui";
import Tutorial, { tutorialSeen } from "@/components/Tutorial";
import FirstRunLanguage from "@/components/FirstRunLanguage";
import { hasChosenLang } from "@/lib/i18n";
import { useT } from "@/components/I18nProvider";

function MenuButton({
  href, emoji, title, subtitle, primary,
}: {
  href: string; emoji: string; title: string; subtitle: string; primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition active:scale-[0.98] ${
        primary ? "border-brand-500 bg-brand-600/20 hover:bg-brand-600/30" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="min-w-0">
        <span className="block text-lg font-bold text-white">{title}</span>
        <span className="block text-sm text-white/50">{subtitle}</span>
      </span>
      <span className="ml-auto text-white/30">›</span>
    </Link>
  );
}

const FIRST_RUN_KEY = "gtn-first-run-done";

export default function HomeMenu() {
  const t = useT();
  const [needLang, setNeedLang] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem(FIRST_RUN_KEY)) {
      window.localStorage.setItem(FIRST_RUN_KEY, "1");
      if (!window.localStorage.getItem("gtn-default-digits")) {
        window.localStorage.setItem("gtn-default-digits", "5");
      }
    }
    if (!hasChosenLang()) setNeedLang(true);
    else if (!tutorialSeen()) setShowTutorial(true);
  }, []);

  return (
    <main className="flex flex-1 flex-col justify-center gap-6">
      {needLang && (
        <FirstRunLanguage
          onDone={() => {
            setNeedLang(false);
            if (!tutorialSeen()) setShowTutorial(true);
          }}
        />
      )}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">{t("appTitle")}</h1>
        <p className="mt-2 text-sm text-white/60">{t("tagline")}</p>
      </header>

      {!isSupabaseConfigured && (
        <ErrorBanner message="Supabase is not configured — multiplayer needs keys in .env.local (single player still works)." />
      )}

      <nav className="flex flex-col gap-3">
        <MenuButton href="/solo" emoji="🧠" title={t("menu_single")} subtitle={t("menu_single_sub")} primary />
        <MenuButton href="/play" emoji="🎮" title={t("menu_multi")} subtitle={t("menu_multi_sub")} />
        <MenuButton href="/help" emoji="📖" title={t("menu_help")} subtitle={t("menu_help_sub")} />
        <MenuButton href="/stats" emoji="📊" title={t("menu_stats")} subtitle={t("menu_stats_sub")} />
        <MenuButton href="/settings" emoji="⚙️" title={t("menu_settings")} subtitle={t("menu_settings_sub")} />
      </nav>

      <p className="px-2 text-center text-xs leading-relaxed text-white/40">{t("menu_footer")}</p>
    </main>
  );
}
