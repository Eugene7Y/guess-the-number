"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DIGIT_OPTIONS } from "@/lib/gameLogic";
import { Button, Card, Label, TextInput } from "@/components/ui";
import ThemePicker from "@/components/ThemePicker";
import LanguagePicker from "@/components/LanguagePicker";
import { useT } from "@/components/I18nProvider";

const COUPLE_KEY = "gtn-couple";

export default function SettingsPage() {
  const router = useRouter();
  const t = useT();
  const [name, setName] = useState("");
  const [digits, setDigits] = useState(4);
  const [couple, setCouple] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(window.localStorage.getItem("gtn-name") || "");
    const d = parseInt(window.localStorage.getItem("gtn-default-digits") || "4", 10);
    if (DIGIT_OPTIONS.includes(d as (typeof DIGIT_OPTIONS)[number])) setDigits(d);
    setCouple(window.localStorage.getItem(COUPLE_KEY) === "1");
  }, []);

  const save = () => {
    window.localStorage.setItem("gtn-name", name.trim());
    window.localStorage.setItem("gtn-default-digits", String(digits));
    window.localStorage.setItem(COUPLE_KEY, couple ? "1" : "0");
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 py-2">
      <header className="text-center">
        <div className="text-4xl">⚙️</div>
        <h1 className="mt-2 text-2xl font-extrabold text-white">{t("set_title")}</h1>
      </header>

      <Card>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/50">{t("set_language")}</h3>
        <LanguagePicker />
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/50">{t("set_appearance")}</h3>
        <ThemePicker />
      </Card>

      <Card>
        <Label>{t("set_name")}</Label>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder={t("set_name")}
          maxLength={20}
        />

        <div className="mt-5">
          <Label>{t("set_defaultLen")}</Label>
          <div className="grid grid-cols-4 gap-2">
            {DIGIT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setDigits(n)}
                className={`rounded-xl border py-3 text-lg font-bold transition active:scale-95 ${
                  n === digits ? "border-brand-500 bg-brand-500/20 text-white" : "border-white/15 bg-white/5 text-white/60"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setCouple((c) => !c)}
          className={`mt-5 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
            couple ? "border-pink-500/50 bg-pink-500/15" : "border-white/10 bg-white/5"
          }`}
        >
          <span>
            <span className="block font-semibold text-white">💞 {t("set_couple")}</span>
            <span className="block text-xs text-white/50">{t("set_couple_sub")}</span>
          </span>
          <span className={`ml-2 inline-block h-3.5 w-3.5 rounded-full ${couple ? "bg-pink-400" : "bg-white/25"}`} />
        </button>

        <div className="mt-5">
          <Button onClick={save}>{saved ? t("b_saved") : t("b_save")}</Button>
        </div>
      </Card>

      <p className="text-center text-xs text-white/40">{t("set_device")}</p>

      <button onClick={() => router.push("/")} className="text-center text-xs text-white/40 hover:text-white/70">
        ← {t("b_back")}
      </button>
    </main>
  );
}
