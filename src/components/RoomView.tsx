"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/useGame";
import type { Guess, Player, Room, RoomSettings } from "@/lib/types";
import { formatDuration, type PastGuess } from "@/lib/gameLogic";
import { recordGame } from "@/lib/stats";
import { evaluateAchievements, type Achievement } from "@/lib/achievements";
import { coupleModeOn, randomChallenge } from "@/lib/couple";
import { saveMatch } from "@/lib/history";
import { useT, useI18n } from "./I18nProvider";
import { SETTINGS, byId } from "@/lib/gameContent";
import { localizeEntry } from "@/lib/i18n/content";
import Confetti from "./Confetti";
import EndExtras from "./EndExtras";
import DigitInput from "./DigitInput";
import GuessHistory from "./GuessHistory";
import RoomHeader from "./RoomHeader";
import RangeTracker from "./RangeTracker";
import InviteShare from "./InviteShare";
import { Button, Card, ErrorBanner, Label, TextInput } from "./ui";

const toPast = (gs: Guess[]): PastGuess[] =>
  gs.map((g) => ({ guess: g.guess, result: g.result }));

export default function RoomView({ code }: { code: string }) {
  const router = useRouter();
  const t = useT();
  const game = useGame(code);
  const {
    loading,
    resolvedMembership,
    room,
    players,
    guesses,
    opponentGuessCount,
    mySecret,
    me,
    opponent,
    onlineUserIds,
  } = game;

  const goHome = () => router.push("/");

  if (loading || !resolvedMembership) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-pulse text-white/50">{t("rv_connecting")}</div>
      </div>
    );
  }

  if (!room) {
    return <JoinGate code={code} onJoin={game.joinRoom} onBack={goHome} />;
  }

  return (
    <main className="flex flex-1 flex-col gap-4">
      <RoomHeader code={code} me={me} opponent={opponent} onlineUserIds={onlineUserIds} />

      {room.status === "waiting" && <WaitingPhase code={code} />}

      {room.status === "setup" && (
        <SetupPhase
          room={room}
          isHost={!!me?.is_host}
          anySubmitted={!!me?.has_submitted || !!opponent?.has_submitted}
          submitted={!!me?.has_submitted}
          opponentSubmitted={!!opponent?.has_submitted}
          hasOpponent={!!opponent}
          mySecret={mySecret}
          secretHidden={!!me?.secret_hidden}
          onSettings={game.setRoomSettings}
          onSubmit={game.submitSecret}
          onSubmitRandom={game.submitRandomSecret}
        />
      )}

      {room.status === "playing" && (
        <PlayPhase
          room={room}
          myTurn={room.turn === me?.id}
          opponentName={opponent?.name ?? t("rv_opponent")}
          guesses={guesses}
          opponentGuessCount={opponentGuessCount}
          players={players}
          meId={me?.id ?? null}
          mySecret={mySecret}
          secretHidden={!!me?.secret_hidden}
          onGuess={game.makeGuess}
          onSkip={game.skipTurn}
          onHint={game.getHint}
        />
      )}

      {room.status !== "finished" && (
        <div className="mt-auto pt-2 text-center">
          <LeaveLink onLeave={game.leave} onDone={goHome} />
        </div>
      )}

      {room.status === "finished" && (
        <FinishedOverlay
          room={room}
          iWon={room.winner === me?.id}
          winner={players.find((p) => p.id === room.winner) ?? null}
          myAttempts={guesses.length}
          opponentAttempts={opponentGuessCount}
          onReset={game.rematch}
          onNewGame={async () => {
            await game.leave();
            goHome();
          }}
        />
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */

function LeaveLink({ onLeave, onDone }: { onLeave: () => Promise<void>; onDone: () => void }) {
  const t = useT();
  return (
    <button
      onClick={async () => {
        await onLeave();
        onDone();
      }}
      className="text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
    >
      {t("b_leave")}
    </button>
  );
}

function MySecretChip({ secret, hidden }: { secret: string | null; hidden: boolean }) {
  const t = useT();
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-center">
      <span className="text-xs uppercase tracking-wide text-white/40">{t("rv_your_secret")}</span>
      <div className="mt-0.5 font-mono text-xl font-bold tracking-[0.3em] text-white">
        {hidden ? (
          <span className="text-base font-semibold tracking-normal text-amber-300">
            🙈 {t("rv_hidden_blind")}
          </span>
        ) : secret ? (
          secret
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function JoinGate({
  code,
  onJoin,
  onBack,
}: {
  code: string;
  onJoin: (name: string) => Promise<void>;
  onBack: () => void;
}) {
  const t = useT();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("gtn-name");
    setName(saved && saved.trim() ? saved : "Player 2");
  }, []);

  const join = async () => {
    if (!name.trim()) return setErr(t("rv_enter_name"));
    setBusy(true);
    setErr("");
    try {
      window.localStorage.setItem("gtn-name", name.trim());
      await onJoin(name.trim());
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("rv_err_join"));
      setBusy(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col justify-center gap-6">
      <header className="text-center">
        <div className="mb-2 text-4xl">👋</div>
        <h1 className="text-2xl font-extrabold text-white">{t("rv_join_title")}</h1>
        <p className="mt-2 text-sm text-white/60">
          {t("rv_join_sub", { code: "" })}{" "}
          <span className="font-mono font-bold tracking-widest">{code}</span>
        </p>
      </header>
      <Card>
        <Label>{t("rv_your_name")}</Label>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder={t("rv_your_name")}
          maxLength={20}
          autoFocus
        />
        {err && (
          <div className="mt-4">
            <ErrorBanner message={err} />
          </div>
        )}
        <div className="mt-5 flex flex-col gap-3">
          <Button onClick={join} disabled={busy}>
            {busy ? t("rv_joining") : t("rv_join_btn")}
          </Button>
          <Button variant="ghost" onClick={onBack} disabled={busy}>
            {t("rv_back_home")}
          </Button>
        </div>
      </Card>
    </main>
  );
}

/* -------------------------------------------------------------------------- */

function WaitingPhase({ code }: { code: string }) {
  const t = useT();
  return (
    <Card className="text-center">
      <div className="mb-3 text-4xl">🎮</div>
      <h2 className="text-lg font-bold text-white">{t("rv_waiting_title")}</h2>
      <p className="mt-2 text-sm text-white/60">{t("rv_waiting_sub", { code })}</p>
      <div className="mt-4">
        <InviteShare code={code} />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/40">
        <span className="h-2 w-2 animate-ping rounded-full bg-brand-400" />
        {t("rv_waiting")}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

function Toggle({
  label,
  on,
  onChange,
  disabled,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
        on ? "border-brand-500 bg-brand-500/15 text-white" : "border-white/10 bg-white/5 text-white/60"
      } ${disabled ? "opacity-60" : "active:scale-[0.99]"}`}
    >
      <span>{label}</span>
      <span className={`ml-2 inline-block h-3 w-3 rounded-full ${on ? "bg-emerald-400" : "bg-white/25"}`} />
    </button>
  );
}

function SetupPhase({
  room,
  isHost,
  anySubmitted,
  submitted,
  opponentSubmitted,
  hasOpponent,
  mySecret,
  secretHidden,
  onSettings,
  onSubmit,
  onSubmitRandom,
}: {
  room: Room;
  isHost: boolean;
  anySubmitted: boolean;
  submitted: boolean;
  opponentSubmitted: boolean;
  hasOpponent: boolean;
  mySecret: string | null;
  secretHidden: boolean;
  onSettings: (s: RoomSettings) => Promise<void>;
  onSubmit: (secret: string) => Promise<void>;
  onSubmitRandom: (reveal: boolean) => Promise<string | null>;
}) {
  const { lang, t } = useI18n();
  const digits = room.digits;
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const setName = (id: string) => {
    const e = byId(SETTINGS, id);
    return e ? localizeEntry(e, lang).name : id;
  };

  useEffect(() => setSecret(""), [digits]);

  const settings: RoomSettings = {
    digits: room.digits,
    turnSeconds: room.turn_seconds,
    allowRandom: room.allow_random,
    allowHidden: room.allow_hidden,
    allowHints: room.allow_hints,
    allowTracker: room.allow_tracker,
  };

  const update = (patch: Partial<RoomSettings>) =>
    onSettings({ ...settings, ...patch }).catch((e) =>
      setErr(e instanceof Error ? e.message : t("rv_err_settings"))
    );

  const submit = async () => {
    if (secret.length !== digits) return setErr(t("sp_err_digits", { n: digits }));
    setBusy(true);
    setErr("");
    try {
      await onSubmit(secret);
      setSecret("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("rv_err_submit"));
    } finally {
      setBusy(false);
    }
  };

  const random = async (reveal: boolean) => {
    setBusy(true);
    setErr("");
    try {
      await onSubmitRandom(reveal);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("rv_err_generate"));
    } finally {
      setBusy(false);
    }
  };

  const lockable = isHost && !anySubmitted;

  return (
    <div className="flex flex-col gap-4">
      {/* Host settings */}
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wide text-white/50">
          {t("rv_round_settings")} {isHost ? "" : t("rv_set_by_host")}
        </h3>

        <div className="mt-3 text-xs text-white/50">{t("sp_length")}</div>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {[3, 4, 5, 6].map((n) => (
            <button
              key={n}
              disabled={!lockable}
              onClick={() => update({ digits: n })}
              className={`rounded-xl border py-3 text-lg font-bold transition ${
                n === digits
                  ? "border-brand-500 bg-brand-500/20 text-white"
                  : "border-white/15 bg-white/5 text-white/60"
              } ${lockable ? "active:scale-95" : "cursor-not-allowed opacity-70"}`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-4 text-xs text-white/50">{t("rv_turn_timer")}</div>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {[
            { v: 0, l: "∞" },
            { v: 15, l: "15s" },
            { v: 30, l: "30s" },
            { v: 60, l: "60s" },
          ].map((o) => (
            <button
              key={o.v}
              disabled={!lockable}
              onClick={() => update({ turnSeconds: o.v })}
              className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                o.v === room.turn_seconds
                  ? "border-brand-500 bg-brand-500/20 text-white"
                  : "border-white/15 bg-white/5 text-white/60"
              } ${lockable ? "active:scale-95" : "cursor-not-allowed opacity-70"}`}
            >
              {o.l}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Toggle label={setName("random-secret")} on={room.allow_random} disabled={!lockable} onChange={(v) => update({ allowRandom: v })} />
          <Toggle label={setName("hidden-random")} on={room.allow_hidden} disabled={!lockable} onChange={(v) => update({ allowHidden: v })} />
          <Toggle label={setName("hints")} on={room.allow_hints} disabled={!lockable} onChange={(v) => update({ allowHints: v })} />
          <Toggle label={setName("range-tracker")} on={room.allow_tracker} disabled={!lockable} onChange={(v) => update({ allowTracker: v })} />
        </div>
        {isHost && anySubmitted && (
          <p className="mt-2 text-xs text-white/40">{t("rv_settings_lock")}</p>
        )}
      </Card>

      {submitted ? (
        <Card className="text-center">
          <div className="mb-3 text-4xl">🔒</div>
          <h2 className="text-lg font-bold text-white">{t("rv_locked_title")}</h2>
          <div className="mx-auto mt-3 max-w-xs">
            <MySecretChip secret={mySecret} hidden={secretHidden} />
          </div>
          <p className="mt-3 text-sm text-white/60">
            {opponentSubmitted
              ? t("rv_starting")
              : hasOpponent
                ? t("rv_waiting_lock")
                : t("rv_waiting_opp")}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/40">
            <span className="h-2 w-2 animate-ping rounded-full bg-brand-400" />
            {t("rv_almost")}
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-lg font-bold text-white">{t("rv_pick_title")}</h2>
          <p className="mt-1 text-sm text-white/60">
            {t("rv_pick_sub", { n: digits })}
          </p>
          <div className="my-5">
            <DigitInput value={secret} onChange={setSecret} length={digits} mask autoFocus
              ariaLabel={t("rv_aria_secret", { n: digits })} />
          </div>
          {err && (
            <div className="mb-3">
              <ErrorBanner message={err} />
            </div>
          )}
          <Button onClick={submit} disabled={busy || secret.length !== digits}>
            {busy ? t("rv_locking") : t("rv_lock_btn")}
          </Button>

          {(room.allow_random || room.allow_hidden) && (
            <>
              <div className="my-4 flex items-center gap-3 text-xs text-white/30">
                <span className="h-px flex-1 bg-white/10" />
                {t("rv_or_system")}
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="flex flex-col gap-2">
                {room.allow_random && (
                  <Button variant="ghost" onClick={() => random(true)} disabled={busy}>
                    🎲 {t("rv_random_show")}
                  </Button>
                )}
                {room.allow_hidden && (
                  <Button variant="ghost" onClick={() => random(false)} disabled={busy}>
                    🙈 {t("rv_random_hidden")}
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PlayPhase({
  room,
  myTurn,
  opponentName,
  guesses,
  opponentGuessCount,
  players,
  meId,
  mySecret,
  secretHidden,
  onGuess,
  onSkip,
  onHint,
}: {
  room: Room;
  myTurn: boolean;
  opponentName: string;
  guesses: Guess[];
  opponentGuessCount: number;
  players: Player[];
  meId: string | null;
  mySecret: string | null;
  secretHidden: boolean;
  onGuess: (guess: string) => Promise<"higher" | "lower" | "correct">;
  onSkip: () => Promise<void>;
  onHint: (index: number) => Promise<string>;
}) {
  const t = useT();
  const digits = room.digits;
  const [guess, setGuess] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const skippedFor = useRef<string | null>(null);

  // turn timer countdown + auto-skip when the player on turn runs out
  useEffect(() => {
    if (!room.turn_deadline) {
      setRemaining(null);
      return;
    }
    const deadline = new Date(room.turn_deadline).getTime();
    const tick = () => {
      const sec = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(sec);
      if (sec <= 0 && myTurn && skippedFor.current !== room.turn_deadline) {
        skippedFor.current = room.turn_deadline;
        onSkip().catch(() => {});
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [room.turn_deadline, myTurn, onSkip]);

  const myLast = [...guesses].reverse()[0];

  const submit = async () => {
    if (guess.length !== digits) return setErr(t("sp_err_digits", { n: digits }));
    setBusy(true);
    setErr("");
    try {
      await onGuess(guess);
      setGuess("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("rv_err_guess"));
    } finally {
      setBusy(false);
    }
  };

  const askHint = async () => {
    try {
      const h = await onHint(hints.length);
      setHints((prev) => [...prev, h]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("rv_err_hint"));
    }
  };

  const expired = remaining !== null && remaining <= 0;

  return (
    <div className="flex flex-col gap-4">
      <MySecretChip secret={mySecret} hidden={secretHidden} />

      {room.turn_seconds > 0 && remaining !== null && (
        <div
          className={`rounded-xl border px-4 py-2 text-center text-sm font-bold ${
            remaining <= 5 && myTurn
              ? "border-red-500/40 bg-red-500/15 text-red-200"
              : "border-white/10 bg-white/[0.03] text-white/70"
          }`}
        >
          ⏱ {myTurn ? t("rv_your_time") : t("rv_opp_time", { name: opponentName })}: {remaining}s
        </div>
      )}

      <Card>
        <div
          className={`mb-1 text-center text-sm font-bold uppercase tracking-wide ${
            myTurn ? "text-emerald-300" : "text-white/50"
          }`}
        >
          {myTurn ? t("sp_your_turn") : t("rv_opp_turn", { name: opponentName })}
        </div>
        <p className="mb-4 text-center text-sm text-white/60">
          {myTurn
            ? t("rv_guess_prompt", { name: opponentName, n: digits })
            : t("rv_waiting_guess")}
        </p>

        <div className="my-2">
          <DigitInput value={guess} onChange={setGuess} length={digits} disabled={!myTurn || busy} ariaLabel={t("rv_aria_guess")} />
        </div>

        {myLast && (
          <div className="mt-3 text-center text-base">
            {t("rv_last_guess")} <span className="font-mono font-bold tracking-widest">{myLast.guess}</span> →{" "}
            {myLast.result === "higher" && <span className="font-extrabold text-amber-300">{t("res_higher")} ↑</span>}
            {myLast.result === "lower" && <span className="font-extrabold text-sky-300">{t("res_lower")} ↓</span>}
            {myLast.result === "correct" && <span className="font-extrabold text-emerald-300">{t("res_correct")} ✓</span>}
          </div>
        )}

        {err && (
          <div className="mt-3">
            <ErrorBanner message={err} />
          </div>
        )}

        <div className="mt-4">
          <Button onClick={submit} disabled={!myTurn || busy || guess.length !== digits}>
            {busy ? t("rv_checking") : myTurn ? t("b_submit") : t("rv_wait_turn")}
          </Button>
        </div>

        {room.allow_hints && myTurn && (
          <button
            onClick={askHint}
            className="mt-3 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition active:scale-95"
          >
            💡 {t("sp_get_hint")}
          </button>
        )}

        {!myTurn && expired && (
          <button
            onClick={() => onSkip().catch(() => {})}
            className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition active:scale-95"
          >
            {t("rv_skip_timeout")}
          </button>
        )}
      </Card>

      {room.allow_tracker && guesses.length > 0 && (
        <RangeTracker digits={digits} history={toPast(guesses)} />
      )}

      {hints.length > 0 && (
        <Card className="!p-3">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-white/50">{t("sp_hints_title")}</h3>
          <ul className="flex flex-col gap-1 text-sm text-amber-100">
            {hints.map((h, i) => (
              <li key={i}>💡 {h}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="!p-3">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">{t("rv_my_guesses")}</h3>
          <GuessHistory guesses={guesses} players={players} meId={meId} />
        </Card>
        <Card className="!p-3">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">{t("rv_opp_activity")}</h3>
          <OpponentActivity
            count={opponentGuessCount}
            opponentName={opponentName}
            isOpponentTurn={!myTurn}
            status="playing"
            opponentWon={false}
          />
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function OpponentActivity({
  count,
  opponentName,
  isOpponentTurn,
  status,
  opponentWon,
}: {
  count: number;
  opponentName: string;
  isOpponentTurn: boolean;
  status: "playing" | "finished";
  opponentWon: boolean;
}) {
  const t = useT();
  return (
    <ul className="flex flex-col gap-2">
      {count === 0 && status === "playing" && (
        <li className="py-2 text-center text-sm text-white/40">{t("rv_no_guesses")}</li>
      )}
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70"
        >
          <span className="text-white/40">🔒</span> {t("rv_guess_submitted", { n: i + 1 })}
        </li>
      ))}
      {status === "playing" && isOpponentTurn && (
        <li className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          🤔 {t("rv_opp_thinking", { name: opponentName })}
        </li>
      )}
      {status === "finished" && (
        <li
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
            opponentWon ? "bg-red-500/15 text-red-200" : "bg-emerald-500/15 text-emerald-200"
          }`}
        >
          {opponentWon
            ? t("rv_opp_won", { name: opponentName })
            : t("rv_opp_lost", { name: opponentName })}
        </li>
      )}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */

function FinishedOverlay({
  room,
  iWon,
  winner,
  myAttempts,
  opponentAttempts,
  onReset,
  onNewGame,
}: {
  room: Room;
  iWon: boolean;
  winner: Player | null;
  myAttempts: number;
  opponentAttempts: number;
  onReset: () => Promise<void>;
  onNewGame: () => Promise<void>;
}) {
  const { lang, t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [newly, setNewly] = useState<Achievement[]>([]);
  const [challenge, setChallenge] = useState<string | null>(null);

  const durationMs =
    room.started_at ? new Date(room.updated_at).getTime() - new Date(room.started_at).getTime() : 0;
  const winnerNumber = winner ? (winner.is_host ? t("rv_p1") : t("rv_p2")) : "";
  const winnerAttempts = iWon ? myAttempts : opponentAttempts;

  // record this result in local statistics exactly once per finished game,
  // then evaluate achievements and (if a win in couple mode) draw a challenge.
  useEffect(() => {
    const key = `gtn-rec-${room.id}-${room.started_at ?? ""}`;
    if (typeof window === "undefined" || window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
    recordGame({ won: iWon, guesses: myAttempts, durationMs });
    setNewly(evaluateAchievements({ won: iWon, guesses: myAttempts, durationMs, digits: room.digits }));
    const rules: string[] = [];
    if (room.turn_seconds > 0) rules.push(t("rv_tag_timer", { n: room.turn_seconds }));
    if (room.allow_hints) { const e = byId(SETTINGS, "hints"); rules.push(e ? localizeEntry(e, lang).name : "Hints"); }
    if (!room.allow_tracker) rules.push(t("sp_rule_tracker_off"));
    saveMatch({
      mode: "classic", opponent: "human", won: iWon, guesses: myAttempts,
      durationMs, digits: room.digits, rules,
    });
    if (iWon && coupleModeOn()) setChallenge(randomChallenge());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doReset = async () => {
    setBusy(true);
    setErr("");
    try {
      await onReset();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("rv_err_reset"));
      setBusy(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center ${
        iWon
          ? "animate-fade-in bg-gradient-to-b from-emerald-500 to-emerald-700"
          : "animate-shake bg-gradient-to-b from-red-500 to-red-800"
      }`}
    >
      {iWon && <Confetti />}
      <div className="text-7xl">{iWon ? "🏆" : "💥"}</div>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-white drop-shadow sm:text-5xl">
        {iWon ? t("win") : t("lose")}
      </h1>
      <p className="mt-3 text-lg font-semibold text-white/90">
        {t("rv_won_line", { who: `${winnerNumber}${winner?.name ? ` (${winner.name})` : ""}` })}
      </p>
      <p className="mt-1 text-sm text-white/80">
        {winnerAttempts} {t("guessesWord")} · {formatDuration(durationMs)}
      </p>

      <EndExtras
        newly={newly}
        challenge={challenge}
        onReroll={() => setChallenge((c) => randomChallenge(c ?? undefined))}
      />

      {err && (
        <div className="mt-5 w-full max-w-xs">
          <ErrorBanner message={err} />
        </div>
      )}

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={doReset}
          disabled={busy}
          className="w-full rounded-2xl bg-white px-6 py-5 text-2xl font-black text-gray-900 shadow-xl transition active:scale-95 disabled:opacity-60"
        >
          {busy ? t("rv_restarting") : t("rv_rematch")}
        </button>
        <button
          onClick={doReset}
          disabled={busy}
          className="w-full rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white transition active:scale-95 disabled:opacity-60"
        >
          {t("rv_reset_new")}
        </button>
        <button
          onClick={onNewGame}
          disabled={busy}
          className="w-full rounded-xl px-6 py-3 text-sm text-white/80 transition active:scale-95 disabled:opacity-60"
        >
          {t("rv_new_game")}
        </button>
      </div>
    </div>
  );
}
