export type LangCode = "uk" | "en" | "ru" | "es" | "it" | "fr" | "de" | "pl";

export interface Locale {
  code: LangCode;
  name: string; // English name
  native: string; // endonym
  flag: string;
}

// Ukrainian is the default. Adding a language = add a Locale here + a dictionary.
export const LOCALES: Locale[] = [
  { code: "uk", name: "Ukrainian", native: "Українська", flag: "🇺🇦" },
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "pl", name: "Polish", native: "Polski", flag: "🇵🇱" },
];

export const DEFAULT_LANG: LangCode = "uk";
export const LANG_KEY = "gtn-lang";

export const isLang = (v: string | null | undefined): v is LangCode =>
  !!v && LOCALES.some((l) => l.code === v);

/** Best-effort detection from the browser's preferred languages. */
export function detectLang(): LangCode {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const p of prefs) {
    const code = p.toLowerCase().split("-")[0];
    if (isLang(code)) return code as LangCode;
  }
  return DEFAULT_LANG;
}
