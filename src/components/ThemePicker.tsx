"use client";

import { useEffect, useState } from "react";
import { THEMES, getTheme, setTheme, type ThemeId } from "@/lib/theme";

export default function ThemePicker() {
  const [active, setActive] = useState<ThemeId>("dark");

  useEffect(() => setActive(getTheme()), []);

  const choose = (id: ThemeId) => {
    setTheme(id);
    setActive(id);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {THEMES.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => choose(t.id)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
              on ? "border-brand-500 bg-brand-500/15" : "border-white/10 bg-white/5"
            }`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/10"
              style={{ background: t.bg }}
            >
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ background: t.accent }}
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">
                {t.emoji} {t.name}
              </span>
            </span>
            {on && <span className="ml-auto text-brand-400">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
