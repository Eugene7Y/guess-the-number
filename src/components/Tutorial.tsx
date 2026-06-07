"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export const TUTORIAL_SEEN_KEY = "gtn-tutorial-seen";

export function markTutorialSeen() {
  if (typeof window !== "undefined") window.localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
}
export function tutorialSeen() {
  return typeof window !== "undefined" && window.localStorage.getItem(TUTORIAL_SEEN_KEY) === "1";
}

interface Step {
  emoji: string;
  title: string;
  body: string;
  demo?: React.ReactNode;
}

export default function Tutorial({ onClose }: { onClose: () => void }) {
  const t = useT();
  const STEPS: Step[] = [
    {
      emoji: "🔒",
      title: t("tut1_title"),
      body: t("tut1_body"),
      demo: (
        <div className="font-mono text-2xl font-bold tracking-[0.3em] text-white">
          4 5 4 4
        </div>
      ),
    },
    { emoji: "⌨️", title: t("tut2_title"), body: t("tut2_body") },
    {
      emoji: "⬆️",
      title: t("tut3_title"),
      body: t("tut3_body"),
      demo: <div className="text-2xl font-extrabold text-amber-300">{t("res_higher")} ↑</div>,
    },
    {
      emoji: "⬇️",
      title: t("tut4_title"),
      body: t("tut4_body"),
      demo: <div className="text-2xl font-extrabold text-sky-300">{t("res_lower")} ↓</div>,
    },
    {
      emoji: "✅",
      title: t("tut5_title"),
      body: t("tut5_body"),
      demo: <div className="text-2xl font-extrabold text-emerald-300">{t("res_correct")} ✓</div>,
    },
    { emoji: "🏆", title: t("tut6_title"), body: t("tut6_body") },
    { emoji: "🎮", title: t("tut7_title"), body: t("tut7_body") },
    { emoji: "🛡️", title: t("tut8_title"), body: t("tut8_body") },
  ];

  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  const finish = () => {
    markTutorialSeen();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/80 px-6 backdrop-blur">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b1020] p-6 text-center animate-pop">
        <div className="text-5xl">{step.emoji}</div>
        <h2 className="mt-3 text-xl font-extrabold text-white">{step.title}</h2>
        {step.demo && <div className="my-3">{step.demo}</div>}
        <p className="mt-2 text-sm leading-relaxed text-white/70">{step.body}</p>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {STEPS.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-5 bg-brand-400" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          {i > 0 && (
            <button
              onClick={() => setI((n) => n - 1)}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white active:scale-95"
            >
              {t("tut_back")}
            </button>
          )}
          <button
            onClick={() => (last ? finish() : setI((n) => n + 1))}
            className="flex-1 rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-lg shadow-brand-600/25 active:scale-[0.98]"
          >
            {last ? t("tut_done") : t("b_next")}
          </button>
        </div>
        <button
          onClick={finish}
          className="mt-3 text-xs text-white/40 hover:text-white/70"
        >
          {t("b_skip")}
        </button>
      </div>
    </div>
  );
}
