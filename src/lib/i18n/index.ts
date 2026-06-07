import { DEFAULT_LANG, LANG_KEY, detectLang, isLang, type LangCode } from "./locales";
import { DICTS, type Dict, type TranslationKey } from "./strings";

export type { LangCode } from "./locales";
export type { TranslationKey } from "./strings";
export { LOCALES } from "./locales";

/** The language to use on load: saved choice → browser detection → default. */
export function initialLang(): LangCode {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (isLang(saved)) return saved;
  }
  return detectLang();
}

/** Has the user explicitly chosen a language yet? */
export function hasChosenLang(): boolean {
  return typeof window !== "undefined" && isLang(window.localStorage.getItem(LANG_KEY));
}

export function persistLang(lang: LangCode) {
  if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, lang);
}

/** Translate with English fallback, then the raw key. Supports {var} interpolation. */
export function translate(
  lang: LangCode,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  const dict: Dict = DICTS[lang] ?? DICTS[DEFAULT_LANG];
  let out = dict[key] ?? DICTS.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.replace(`{${k}}`, String(v));
  }
  return out;
}
