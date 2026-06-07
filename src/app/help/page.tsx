"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InfoPanel from "@/components/InfoPanel";
import Tutorial from "@/components/Tutorial";
import { useI18n } from "@/components/I18nProvider";
import { localizedCategories } from "@/lib/i18n/content";

export default function HelpPage() {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [tutorial, setTutorial] = useState(false);
  const categories = localizedCategories(lang);

  return (
    <main className="flex flex-1 flex-col gap-4 py-2">
      {tutorial && <Tutorial onClose={() => setTutorial(false)} />}

      <header className="text-center">
        <div className="text-4xl">📖</div>
        <h1 className="mt-2 text-2xl font-extrabold text-white">{t("help_title")}</h1>
        <p className="mt-1 text-sm text-white/60">{t("help_sub")}</p>
      </header>

      <button
        onClick={() => setTutorial(true)}
        className="rounded-xl border border-brand-500 bg-brand-600/20 px-4 py-3 font-semibold text-white transition active:scale-[0.99]"
      >
        ▶ {t("help_tutorial")}
      </button>

      {categories.map((cat) => (
        <section key={cat.title} className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white/50">
            {cat.title}
          </h2>
          {cat.items.map((e) => (
            <InfoPanel key={e.id} entry={e} />
          ))}
        </section>
      ))}

      <button
        onClick={() => router.push("/")}
        className="mt-2 text-center text-xs text-white/40 hover:text-white/70"
      >
        ← {t("b_back")}
      </button>
    </main>
  );
}
