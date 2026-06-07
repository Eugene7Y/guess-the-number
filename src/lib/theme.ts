export type ThemeId =
  | "dark"
  | "minimal"
  | "cyberpunk"
  | "matrix"
  | "space"
  | "casino"
  | "military";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  emoji: string;
  /** swatch colors for the picker (base bg, accent) */
  bg: string;
  accent: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "dark", name: "Dark", emoji: "🌙", bg: "#0b1020", accent: "#6366f1" },
  { id: "minimal", name: "Minimal", emoji: "⚪", bg: "#0c0d11", accent: "#64748b" },
  { id: "cyberpunk", name: "Cyberpunk", emoji: "🌆", bg: "#0a0512", accent: "#ec4899" },
  { id: "matrix", name: "Matrix", emoji: "🟢", bg: "#000a03", accent: "#22c55e" },
  { id: "space", name: "Space", emoji: "🪐", bg: "#070718", accent: "#8b5cf6" },
  { id: "casino", name: "Casino", emoji: "🎰", bg: "#05130b", accent: "#f59e0b" },
  { id: "military", name: "Military", emoji: "🎖", bg: "#0e120a", accent: "#a1914f" },
];

export const THEME_KEY = "gtn-theme";
const VALID = new Set(THEMES.map((t) => t.id));

export function getTheme(): ThemeId {
  if (typeof window === "undefined") return "dark";
  const t = window.localStorage.getItem(THEME_KEY);
  return t && VALID.has(t as ThemeId) ? (t as ThemeId) : "dark";
}

export function applyTheme(id: ThemeId) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = id;
  }
}

export function setTheme(id: ThemeId) {
  if (typeof window !== "undefined") window.localStorage.setItem(THEME_KEY, id);
  applyTheme(id);
}

/** Inline script (runs before paint) so the saved theme applies with no flash. */
export const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');var ok=${JSON.stringify(
  THEMES.map((t) => t.id)
)};if(t&&ok.indexOf(t)>=0){document.documentElement.dataset.theme=t;}}catch(e){}})();`;
