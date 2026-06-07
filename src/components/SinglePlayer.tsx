"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DIGIT_OPTIONS,
  computeRange,
  formatDuration,
  generateSecret,
  makeHint,
  type PastGuess,
} from "@/lib/gameLogic";
import { aiGuess, aiMovesFirst, hotCold, resultFor, type AiLevel } from "@/lib/ai";
import { MODES, AI_LEVELS, ABILITIES, byId, type InfoEntry } from "@/lib/gameContent";
import { getBest, recordBest, recordGame } from "@/lib/stats";
import { evaluateAchievements, optimalGuesses, type Achievement } from "@/lib/achievements";
import { coupleModeOn, randomChallenge } from "@/lib/couple";
import { saveMatch } from "@/lib/history";
import { useI18n } from "./I18nProvider";
import { localizeEntry } from "@/lib/i18n/content";
import DigitInput from "./DigitInput";
import RangeTracker from "./RangeTracker";
import Confetti from "./Confetti";
import EndExtras from "./EndExtras";
import InfoPanel from "./InfoPanel";
import { InfoDot } from "./Tooltip";
import { Button, Card, ErrorBanner } from "./ui";

type Opponent = "practice" | AiLevel;
type Phase = "setup" | "summary" | "play" | "won" | "lost";

const SOLO_MODE_IDS = ["classic", "hotcold", "hardcore", "blind", "suddendeath"];

interface Aids {
  tracker: boolean;
  hints: boolean;
  history: boolean;
  liveStats: boolean;
  feedback: "classic" | "hotcold";
  budget: number | null;
}

function aidsFor(mode: string, digits: number): Aids {
  switch (mode) {
    case "hotcold":
      return { tracker: false, hints: false, history: true, liveStats: true, feedback: "hotcold", budget: null };
    case "hardcore":
      return { tracker: false, hints: false, history: false, liveStats: true, feedback: "classic", budget: null };
    case "blind":
      return { tracker: false, hints: false, history: false, liveStats: true, feedback: "classic", budget: null };
    case "suddendeath":
      return { tracker: true, hints: false, history: true, liveStats: true, feedback: "classic", budget: optimalGuesses(digits) + 3 };
    case "speedrun":
      return { tracker: true, hints: false, history: true, liveStats: true, feedback: "classic", budget: null };
    case "classic":
    default:
      return { tracker: true, hints: true, history: true, liveStats: true, feedback: "classic", budget: null };
  }
}

function feedbackLabel(
  secret: string,
  g: string,
  digits: number,
  fb: Aids["feedback"],
  tr: (k: "res_higher" | "res_lower" | "res_correct") => string
) {
  if (fb === "hotcold") {
    const hc = hotCold(secret, g, digits);
    return { text: `${hc.emoji} ${hc.label}`, cls: "text-amber-300" };
  }
  const r = resultFor(secret, g);
  if (r === "higher") return { text: `${tr("res_higher")} ↑`, cls: "text-amber-300" };
  if (r === "lower") return { text: `${tr("res_lower")} ↓`, cls: "text-sky-300" };
  return { text: `${tr("res_correct")} ✓`, cls: "text-emerald-300" };
}

export default function SinglePlayer() {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [phase, setPhase] = useState<Phase>("setup");

  const [opponent, setOpponent] = useState<Opponent>("practice");
  const [digits, setDigits] = useState(4);
  const [mode, setMode] = useState("classic");
  const [abilitiesOn, setAbilitiesOn] = useState(false);

  // live game refs
  const aiSecretRef = useRef(""); // the number the PLAYER must guess
  const mySecretRef = useRef(""); // the number the AI must guess (vs AI only)
  const aiHistRef = useRef<PastGuess[]>([]);
  const playerHistRef = useRef<PastGuess[]>([]);
  const startRef = useRef(0);
  const freezeRef = useRef(false);
  const doubleRef = useRef(false);
  const phaseRef = useRef<Phase>("setup");
  phaseRef.current = phase;
  const runAiMoveRef = useRef<() => void>(() => {});

  const [playerHistory, setPlayerHistory] = useState<PastGuess[]>([]);
  const [aiCount, setAiCount] = useState(0);
  const [turn, setTurn] = useState<"you" | "ai">("you");
  const [guess, setGuess] = useState("");
  const [err, setErr] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [revealedRange, setRevealedRange] = useState<{ low: number; high: number } | null>(null);
  const [revealedDigit, setRevealedDigit] = useState<{ pos: number; val: string } | null>(null);
  const [used, setUsed] = useState({ range: false, digit: false, freeze: false, double: false });
  const [result, setResult] = useState<{
    won: boolean;
    guesses: number;
    durationMs: number;
    aiGuesses: number;
    secret: string;
    improved: boolean;
    best: { bestGuesses: number; bestTimeMs: number } | null;
    newly: Achievement[];
    challenge: string | null;
    ranOut: boolean;
  } | null>(null);

  const vsAi = opponent !== "practice";
  const aids = aidsFor(mode, digits);
  const bestKey = `${digits}-${mode}-${opponent}`;

  // available modes (speed run only makes sense in practice)
  const modeList: InfoEntry[] = MODES.filter(
    (m) => SOLO_MODE_IDS.includes(m.id) || (m.id === "speedrun" && !vsAi)
  );

  /* ----------------------------- lifecycle ----------------------------- */
  const startMatch = useCallback(() => {
    aiSecretRef.current = generateSecret(digits);
    mySecretRef.current = generateSecret(digits);
    aiHistRef.current = [];
    playerHistRef.current = [];
    freezeRef.current = false;
    doubleRef.current = false;
    startRef.current = Date.now();
    setPlayerHistory([]);
    setAiCount(0);
    setGuess("");
    setErr("");
    setHints([]);
    setNote("");
    setRevealedRange(null);
    setRevealedDigit(null);
    setUsed({ range: false, digit: false, freeze: false, double: false });
    setResult(null);
    setElapsed(0);
    setPhase("play");
    if (vsAi && aiMovesFirst(opponent as AiLevel)) {
      setTurn("ai");
      setTimeout(() => runAiMoveRef.current(), 700);
    } else {
      setTurn("you");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, vsAi, opponent]);

  useEffect(() => {
    if (phase !== "play" || !aids.liveStats) return;
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 500);
    return () => clearInterval(id);
  }, [phase, aids.liveStats]);

  const endGame = useCallback(
    (won: boolean, ranOut = false) => {
      const durationMs = Date.now() - startRef.current;
      const guesses = playerHistRef.current.length;
      const secret = parseInt(aiSecretRef.current, 10);
      const priorDists = playerHistRef.current
        .slice(0, won ? -1 : undefined)
        .map((h) => Math.abs(parseInt(h.guess, 10) - secret));
      const closest = priorDists.length ? Math.min(...priorDists) : 0;
      recordGame({ won, guesses, durationMs, closestGuess: closest });
      const newly = evaluateAchievements({ won, guesses, durationMs, digits });
      let best = getBest(bestKey);
      let improved = false;
      if (won) {
        const r = recordBest(bestKey, guesses, durationMs);
        best = r.best;
        improved = r.improved;
      }
      const challenge = won && coupleModeOn() ? randomChallenge() : null;
      const rules: string[] = [];
      if (aids.feedback === "hotcold") rules.push(t("sp_rule_hotcold"));
      if (!aids.tracker) rules.push(t("sp_rule_tracker_off"));
      if (aids.budget) rules.push(t("sp_rule_budget", { n: aids.budget }));
      if (vsAi && abilitiesOn) rules.push(t("sp_rule_abilities"));
      saveMatch({ mode, opponent, won, guesses, durationMs, digits, rules });
      setResult({
        won, guesses, durationMs, aiGuesses: aiHistRef.current.length,
        secret: aiSecretRef.current, improved, best, newly, challenge, ranOut,
      });
      setPhase(won ? "won" : "lost");
    },
    [bestKey, digits, mode, opponent, vsAi, abilitiesOn, aids.feedback, aids.tracker, aids.budget, t]
  );

  const runAiMove = useCallback(() => {
    if (phaseRef.current !== "play") return;
    if (freezeRef.current) {
      freezeRef.current = false;
      setNote(`🧊 ${t("sp_note_frozen")}`);
      setTurn("you");
      return;
    }
    const g = aiGuess(opponent as AiLevel, digits, aiHistRef.current);
    const r = resultFor(mySecretRef.current, g);
    aiHistRef.current = [...aiHistRef.current, { guess: g, result: r }];
    setAiCount(aiHistRef.current.length);
    if (r === "correct") endGame(false);
    else setTurn("you");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opponent, digits, endGame]);
  runAiMoveRef.current = runAiMove;

  const submit = () => {
    if (turn !== "you" || phase !== "play") return;
    if (guess.length !== digits) return setErr(t("sp_err_digits", { n: digits }));
    setErr("");
    setNote("");
    const r = resultFor(aiSecretRef.current, guess);
    playerHistRef.current = [...playerHistRef.current, { guess, result: r }];
    setPlayerHistory([...playerHistRef.current]);
    setGuess("");
    if (r === "correct") return endGame(true);
    if (aids.budget && playerHistRef.current.length >= aids.budget) return endGame(false, true);
    if (doubleRef.current) {
      doubleRef.current = false;
      setNote(`⏩ ${t("sp_note_double_again")}`);
      return;
    }
    if (vsAi) {
      setTurn("ai");
      setTimeout(() => runAiMoveRef.current(), 800);
    }
  };

  const askHint = () => {
    const range = computeRange(digits, playerHistRef.current);
    setHints((h) => [...h, makeHint(aiSecretRef.current, range, h.length, t)]);
  };

  // abilities
  const useRange = () => {
    if (used.range) return;
    setUsed((u) => ({ ...u, range: true }));
    setRevealedRange(computeRange(digits, playerHistRef.current));
  };
  const useDigit = () => {
    if (used.digit) return;
    setUsed((u) => ({ ...u, digit: true }));
    setRevealedDigit({ pos: 0, val: aiSecretRef.current[0] });
  };
  const useFreeze = () => {
    if (used.freeze) return;
    setUsed((u) => ({ ...u, freeze: true }));
    freezeRef.current = true;
    setNote(`🧊 ${t("sp_note_will_freeze")}`);
  };
  const useDouble = () => {
    if (used.double) return;
    setUsed((u) => ({ ...u, double: true }));
    doubleRef.current = true;
    setNote(`⏩ ${t("sp_note_double_armed")}`);
  };

  const best = getBest(bestKey);
  const opponentEntryRaw = vsAi ? byId(AI_LEVELS, opponent) : undefined;
  const modeEntryRaw = byId(MODES, mode);
  const opponentEntry = opponentEntryRaw ? localizeEntry(opponentEntryRaw, lang) : undefined;
  const modeEntry = modeEntryRaw ? localizeEntry(modeEntryRaw, lang) : undefined;
  const abName = (id: string) => {
    const e = byId(ABILITIES, id);
    return e ? localizeEntry(e, lang).name : id;
  };

  /* ------------------------------ SETUP ------------------------------ */
  if (phase === "setup") {
    return (
      <main className="flex flex-1 flex-col gap-4 py-2">
        <header className="text-center">
          <div className="text-4xl">🧠</div>
          <h1 className="mt-2 text-2xl font-extrabold text-white">{t("menu_single")}</h1>
          <p className="mt-1 text-sm text-white/60">{t("sp_setup_sub")}</p>
        </header>

        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white/50">
            {t("sp_opponent")} <InfoDot text={t("sp_opponent_hint")} />
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <OptBtn active={opponent === "practice"} onClick={() => setOpponent("practice")}>
              🎯 {t("sp_practice")}
            </OptBtn>
            {AI_LEVELS.map((a) => (
              <OptBtn key={a.id} active={opponent === a.id} onClick={() => setOpponent(a.id as Opponent)}>
                {a.emoji} {localizeEntry(a, lang).name}
              </OptBtn>
            ))}
          </div>
          {opponentEntry && (
            <div className="mt-2">
              <InfoPanel entry={opponentEntry} />
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white/50">{t("sp_mode")}</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {modeList.map((m) => (
              <OptBtn key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
                {m.emoji} {localizeEntry(m, lang).name}
              </OptBtn>
            ))}
          </div>
          {modeEntry && (
            <div className="mt-2">
              <InfoPanel entry={modeEntry} />
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white/50">
            {t("sp_length")} <InfoDot text={t("sp_length_hint")} />
          </h3>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {DIGIT_OPTIONS.map((n) => (
              <OptBtn key={n} active={n === digits} onClick={() => setDigits(n)}>
                {n}
              </OptBtn>
            ))}
          </div>

          {vsAi && (
            <button
              onClick={() => setAbilitiesOn((v) => !v)}
              className={`mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                abilitiesOn ? "border-brand-500 bg-brand-500/15" : "border-white/10 bg-white/5"
              }`}
            >
              <span>
                <span className="block font-semibold text-white">✨ {t("sp_abilities")}</span>
                <span className="block text-xs text-white/50">{t("sp_abilities_sub")}</span>
              </span>
              <span className={`ml-2 inline-block h-3.5 w-3.5 rounded-full ${abilitiesOn ? "bg-emerald-400" : "bg-white/25"}`} />
            </button>
          )}

          {best && (
            <p className="mt-3 text-center text-xs text-white/50">
              {t("sp_pb_here")}{" "}
              <span className="font-semibold text-white/80">
                {best.bestGuesses} {t("guessesWord")} · {formatDuration(best.bestTimeMs)}
              </span>
            </p>
          )}
        </Card>

        <Button onClick={() => setPhase("summary")}>{t("b_continue")} →</Button>
        <button onClick={() => router.push("/")} className="text-center text-xs text-white/40 hover:text-white/70">
          ← {t("b_back")}
        </button>
      </main>
    );
  }

  /* ---------------------------- SUMMARY ---------------------------- */
  if (phase === "summary") {
    const rules: string[] = [];
    rules.push(aids.feedback === "hotcold" ? t("sp_rule_hotcold") : t("sp_rule_hl"));
    rules.push(aids.tracker ? t("sp_rule_tracker_on") : t("sp_rule_tracker_off"));
    rules.push(aids.hints ? t("sp_rule_hints_on") : t("sp_rule_hints_off"));
    rules.push(aids.history ? t("sp_rule_hist_on") : t("sp_rule_hist_off"));
    if (aids.budget) rules.push(t("sp_rule_budget", { n: aids.budget }));
    if (vsAi && abilitiesOn) rules.push(t("sp_rule_abilities"));
    const estMins = modeEntry?.length ?? (digits <= 4 ? t("sp_est_short") : t("sp_est_long"));

    return (
      <main className="flex flex-1 flex-col justify-center gap-4 py-2">
        <header className="text-center">
          <div className="text-4xl">📋</div>
          <h1 className="mt-2 text-2xl font-extrabold text-white">{t("sp_ready")}</h1>
          <p className="mt-1 text-sm text-white/60">{t("sp_ready_sub")}</p>
        </header>

        <Card className="space-y-3">
          <Row label={t("sp_opponent")} value={vsAi ? `${opponentEntry?.emoji} ${opponentEntry?.name}` : `🎯 ${t("sp_practice")}`} />
          <Row label={t("sp_mode")} value={`${modeEntry?.emoji} ${modeEntry?.name}`} />
          <Row label={t("sp_length")} value={`${digits} ${t("sp_digits")}`} />
          <Row label={t("sp_estlen")} value={estMins} />
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">{t("sp_rules")}</div>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {rules.map((r, i) => (
                <li key={i} className="rounded-md bg-white/5 px-2 py-1 text-xs text-white/70">{r}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-white/60">
            <span>📊 {t("sp_statcount")} <b className="text-white/80">{t("sp_yes")}</b></span>
            <span>🏅 {t("sp_achcount")} <b className="text-white/80">{t("sp_yes")}</b></span>
          </div>
        </Card>

        <Button onClick={startMatch}>{t("b_startMatch")}</Button>
        <button onClick={() => setPhase("setup")} className="text-center text-xs text-white/40 hover:text-white/70">
          ← {t("sp_change_opts")}
        </button>
      </main>
    );
  }

  /* ------------------------------ WON ------------------------------ */
  if ((phase === "won" || phase === "lost") && result) {
    const won = result.won;
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center ${
          won ? "animate-fade-in bg-gradient-to-b from-emerald-500 to-emerald-700" : "animate-shake bg-gradient-to-b from-red-500 to-red-800"
        }`}
      >
        {won && <Confetti />}
        <div className="text-7xl">{won ? "🏆" : "💥"}</div>
        <h1 className="mt-3 text-4xl font-black text-white drop-shadow sm:text-5xl">
          {won ? t("win") : t("lose")}
        </h1>
        <div className="mt-2 text-sm text-white/90">
          {t("theNumberWas")}{" "}
          <span className="font-mono text-lg font-bold tracking-widest">{result.secret}</span>
        </div>
        <p className="mt-2 text-white/90">
          {result.guesses} {t("guessesWord")} · {formatDuration(result.durationMs)}
          {vsAi && ` · ${t("computerWord")}: ${result.aiGuesses}`}
        </p>
        {won && result.improved && <p className="mt-1 text-sm font-bold text-yellow-200">⭐ {t("newBest")}</p>}

        <EndExtras
          newly={result.newly}
          challenge={result.challenge}
          onReroll={() => setResult((r) => (r ? { ...r, challenge: randomChallenge(r.challenge ?? undefined) } : r))}
        />

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <button onClick={startMatch} className="w-full rounded-2xl bg-white px-6 py-4 text-xl font-black text-gray-900 shadow-xl transition active:scale-95">
            {t("b_playAgain")}
          </button>
          <button onClick={() => setPhase("setup")} className="w-full rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white transition active:scale-95">
            {t("b_changeSettings")}
          </button>
          <button onClick={() => router.push("/")} className="w-full rounded-xl px-6 py-3 text-sm text-white/80 transition active:scale-95">
            {t("b_returnMenu")}
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------ PLAY ----------------------------- */
  const last = playerHistory[playerHistory.length - 1];
  const yourTurn = !vsAi || turn === "you";
  return (
    <main className="flex flex-1 flex-col gap-4 py-1">
      <header className="flex items-center justify-between">
        <button onClick={() => setPhase("setup")} className="text-xs text-white/40 hover:text-white/70">← {t("b_quit")}</button>
        <div className="text-xs uppercase tracking-wide text-white/40">
          {vsAi ? `${opponentEntry?.emoji} ${opponentEntry?.name}` : t("sp_practice")} · {modeEntry?.name} · {digits}d
        </div>
      </header>

      {aids.liveStats ? (
        <div className="grid grid-cols-3 gap-2">
          <Mini label={t("sp_guesses_label")} value={String(playerHistory.length)} />
          <Mini label={t("sp_time")} value={formatDuration(elapsed)} />
          <Mini label={vsAi ? t("computerWord") : aids.budget ? t("sp_budget") : t("sp_best")}
            value={vsAi ? String(aiCount) : aids.budget ? `${playerHistory.length}/${aids.budget}` : best ? String(best.bestGuesses) : "—"} />
        </div>
      ) : null}

      {vsAi && (
        <div className={`rounded-xl border px-4 py-2 text-center text-sm font-bold uppercase tracking-wide ${
          yourTurn ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/[0.03] text-white/60"
        }`}>
          {yourTurn ? t("sp_your_turn") : `🤖 ${t("sp_ai_thinking")}`}
        </div>
      )}

      {note && (
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-center text-sm text-brand-100 animate-pop">
          {note}
        </div>
      )}

      <Card>
        <p className="mb-3 text-center text-sm text-white/60">
          {vsAi ? t("sp_guess_ai") : t("sp_guess_solo", { n: digits })}
        </p>
        <DigitInput value={guess} onChange={setGuess} length={digits} disabled={!yourTurn} autoFocus />

        {last && (
          <div className="mt-3 text-center text-base">
            <span className="font-mono font-bold tracking-widest">{last.guess}</span> →{" "}
            {(() => {
              const f = feedbackLabel(aiSecretRef.current, last.guess, digits, aids.feedback, t);
              return <span className={`font-extrabold ${f.cls}`}>{f.text}</span>;
            })()}
          </div>
        )}
        {err && <div className="mt-3"><ErrorBanner message={err} /></div>}

        <div className="mt-4">
          <Button onClick={submit} disabled={!yourTurn || guess.length !== digits}>
            {yourTurn ? t("b_submit") : t("sp_wait")}
          </Button>
        </div>

        {aids.hints && (
          <button onClick={askHint} className="mt-3 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition active:scale-95">
            💡 {t("sp_get_hint")}
          </button>
        )}
      </Card>

      {vsAi && abilitiesOn && (
        <Card className="!p-3">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-white/50">{t("sp_abilities_title")}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Ability label={`📊 ${abName("reveal-range")}`} used={used.range} disabled={!yourTurn} onClick={useRange} />
            <Ability label={`🔍 ${abName("reveal-digit")}`} used={used.digit} disabled={!yourTurn} onClick={useDigit} />
            <Ability label={`🧊 ${abName("freeze")}`} used={used.freeze} disabled={!yourTurn} onClick={useFreeze} />
            <Ability label={`⏩ ${abName("double-turn")}`} used={used.double} disabled={!yourTurn} onClick={useDouble} />
          </div>
          {revealedRange && (
            <p className="mt-2 text-center text-sm text-sky-200">
              📊 {t("sp_possible", { low: revealedRange.low, high: revealedRange.high })}
            </p>
          )}
          {revealedDigit && (
            <p className="mt-1 text-center text-sm text-sky-200">
              🔍 {t("sp_digit_is", { n: revealedDigit.pos + 1, v: revealedDigit.val })}
            </p>
          )}
        </Card>
      )}

      {aids.tracker && (playerHistory.length > 0 || revealedRange) && (
        <RangeTracker digits={digits} history={playerHistory} />
      )}

      {hints.length > 0 && (
        <Card className="!p-3">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-white/50">{t("sp_hints_title")}</h3>
          <ul className="flex flex-col gap-1 text-sm text-amber-100">
            {hints.map((h, i) => <li key={i}>💡 {h}</li>)}
          </ul>
        </Card>
      )}

      {aids.history && playerHistory.length > 0 && (
        <Card className="!p-3">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-white/50">{t("sp_your_guesses")}</h3>
          <ul className="flex flex-col gap-1.5">
            {[...playerHistory].reverse().map((g, i) => {
              const f = feedbackLabel(aiSecretRef.current, g.guess, digits, aids.feedback, t);
              return (
                <li key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
                  <span className="font-mono text-lg font-bold tracking-widest">{g.guess}</span>
                  <span className={`text-xs font-bold ${f.cls}`}>{f.text}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </main>
  );
}

/* ----------------------------- small bits ----------------------------- */
function OptBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition active:scale-95 ${
        active ? "border-brand-500 bg-brand-500/20 text-white" : "border-white/15 bg-white/5 text-white/60"
      }`}
    >
      {children}
    </button>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-white/40">{label}</span>
      <span className="text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
      <div className="text-[11px] uppercase tracking-wide text-white/40">{label}</div>
      <div className="text-xl font-bold tabular-nums text-white">{value}</div>
    </div>
  );
}
function Ability({ label, used, disabled, onClick }: { label: string; used: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={used || disabled}
      className={`rounded-xl border px-2 py-2 text-sm font-semibold transition active:scale-95 ${
        used ? "border-white/5 bg-white/5 text-white/30 line-through" : "border-brand-500/40 bg-brand-500/10 text-white"
      } ${disabled && !used ? "opacity-50" : ""}`}
    >
      {label}
    </button>
  );
}
