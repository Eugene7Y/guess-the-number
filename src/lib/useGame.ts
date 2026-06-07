"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ensureSession, getSupabase } from "./supabaseClient";
import type { Guess, Player, Room, RoomSettings } from "./types";

export interface GameState {
  loading: boolean;
  error: string | null;
  userId: string | null;
  room: Room | null;
  players: Player[];
  /** ONLY the current player's own guesses (opponent's are never fetched) */
  guesses: Guess[];
  /** masked opponent activity: how many guesses the opponent has made */
  opponentGuessCount: number;
  /** the current player's OWN secret, or null if hidden / not yet set */
  mySecret: string | null;
  /** user_ids currently connected via realtime presence */
  onlineUserIds: Set<string>;
}

export interface GameApi extends GameState {
  me: Player | null;
  opponent: Player | null;
  /** true once we know whether the current user is a member of this room */
  resolvedMembership: boolean;
  refresh: () => Promise<void>;
  joinRoom: (name: string) => Promise<void>;
  setDigits: (digits: number) => Promise<void>;
  setRoomSettings: (s: RoomSettings) => Promise<void>;
  skipTurn: () => Promise<void>;
  getHint: (index: number) => Promise<string>;
  submitSecret: (secret: string) => Promise<void>;
  /** generate a random secret server-side; returns it only when reveal=true */
  submitRandomSecret: (reveal: boolean) => Promise<string | null>;
  makeGuess: (guess: string) => Promise<"higher" | "lower" | "correct">;
  rematch: () => Promise<void>;
  leave: () => Promise<void>;
}

/**
 * Subscribes to a single room and keeps room / players / guesses in sync via
 * Supabase Realtime. Also tracks online presence so each side sees whether the
 * opponent is connected, and recovers automatically on reconnect.
 */
export function useGame(code: string): GameApi {
  const [state, setState] = useState<GameState>({
    loading: true,
    error: null,
    userId: null,
    room: null,
    players: [],
    guesses: [],
    opponentGuessCount: 0,
    mySecret: null,
    onlineUserIds: new Set<string>(),
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string | null>(null);

  const fetchAll = useCallback(async () => {
    const supabase = getSupabase();
    // `guesses` is RLS-limited to the caller's OWN rows; the opponent's exact
    // guesses are never returned. Opponent activity comes back only as a count.
    const [roomRes, playersRes, guessesRes, oppRes, secretRes] =
      await Promise.all([
        supabase.from("rooms").select("*").eq("id", code).maybeSingle(),
        supabase.from("players").select("*").eq("room_id", code).order("joined_at"),
        supabase
          .from("guesses")
          .select("*")
          .eq("room_id", code)
          .order("created_at", { ascending: true }),
        supabase.rpc("get_opponent_progress", { p_code: code }),
        supabase.rpc("reveal_my_secret", { p_code: code }),
      ]);

    setState((prev) => ({
      ...prev,
      room: (roomRes.data as Room) ?? null,
      players: (playersRes.data as Player[]) ?? [],
      guesses: (guessesRes.data as Guess[]) ?? [],
      opponentGuessCount:
        typeof oppRes.data === "number" ? oppRes.data : 0,
      mySecret: (secretRes.data as string | null) ?? null,
      loading: false,
      error: roomRes.data ? null : "Room not found or you are not a member.",
    }));
  }, [code]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const uid = await ensureSession();
        if (cancelled) return;
        userIdRef.current = uid;
        setState((prev) => ({ ...prev, userId: uid }));

        await fetchAll();
        if (cancelled) return;

        const supabase = getSupabase();
        const channel = supabase.channel(`room:${code}`, {
          config: { presence: { key: uid } },
        });

        // Only `rooms` and `players` are broadcast (no secrets, no guesses).
        // Every guess updates the room (turn/status), which signals a re-fetch.
        channel
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "rooms", filter: `id=eq.${code}` },
            () => fetchAll()
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "players", filter: `room_id=eq.${code}` },
            () => fetchAll()
          );

        // Presence -> online/offline indicators.
        const syncPresence = () => {
          const presenceState = channel.presenceState();
          const online = new Set<string>(Object.keys(presenceState));
          setState((prev) => ({ ...prev, onlineUserIds: online }));
        };
        channel
          .on("presence", { event: "sync" }, syncPresence)
          .on("presence", { event: "join" }, syncPresence)
          .on("presence", { event: "leave" }, syncPresence);

        channel.subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ user_id: uid, at: Date.now() });
            // Re-pull on (re)connect to catch anything missed while offline.
            fetchAll();
          }
        });

        channelRef.current = channel;
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load game",
        }));
      }
    })();

    // Re-sync when the tab regains focus / connectivity returns.
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchAll();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", fetchAll);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", fetchAll);
      if (channelRef.current) {
        getSupabase().removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [code, fetchAll]);

  const joinRoom = useCallback(
    async (name: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.rpc("join_room", {
        p_code: code,
        p_name: name,
      });
      if (error) throw new Error(error.message);
      await fetchAll();
    },
    [code, fetchAll]
  );

  const setDigits = useCallback(
    async (digits: number) => {
      const supabase = getSupabase();
      const { error } = await supabase.rpc("set_digits", {
        p_code: code,
        p_digits: digits,
      });
      if (error) throw new Error(error.message);
      await fetchAll();
    },
    [code, fetchAll]
  );

  const setRoomSettings = useCallback(
    async (s: RoomSettings) => {
      const supabase = getSupabase();
      const { error } = await supabase.rpc("set_room_settings", {
        p_code: code,
        p_digits: s.digits,
        p_turn_seconds: s.turnSeconds,
        p_allow_random: s.allowRandom,
        p_allow_hidden: s.allowHidden,
        p_allow_hints: s.allowHints,
        p_allow_tracker: s.allowTracker,
      });
      if (error) throw new Error(error.message);
      await fetchAll();
    },
    [code, fetchAll]
  );

  const skipTurn = useCallback(async () => {
    const supabase = getSupabase();
    const { error } = await supabase.rpc("skip_turn", { p_code: code });
    if (error) throw new Error(error.message);
    await fetchAll();
  }, [code, fetchAll]);

  const getHint = useCallback(
    async (index: number) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("get_hint", {
        p_code: code,
        p_index: index,
      });
      if (error) throw new Error(error.message);
      return (data as string) ?? "";
    },
    [code]
  );

  const submitSecret = useCallback(
    async (secret: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.rpc("submit_secret", {
        p_code: code,
        p_secret: secret,
      });
      if (error) throw new Error(error.message);
      await fetchAll();
    },
    [code, fetchAll]
  );

  const submitRandomSecret = useCallback(
    async (reveal: boolean) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("submit_random_secret", {
        p_code: code,
        p_reveal: reveal,
      });
      if (error) throw new Error(error.message);
      await fetchAll();
      return (data as string | null) ?? null;
    },
    [code, fetchAll]
  );

  const makeGuess = useCallback(
    async (guess: string) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("make_guess", {
        p_code: code,
        p_guess: guess,
      });
      if (error) throw new Error(error.message);
      await fetchAll();
      return data as "higher" | "lower" | "correct";
    },
    [code, fetchAll]
  );

  const rematch = useCallback(async () => {
    const supabase = getSupabase();
    const { error } = await supabase.rpc("rematch", { p_code: code });
    if (error) throw new Error(error.message);
    await fetchAll();
  }, [code, fetchAll]);

  const leave = useCallback(async () => {
    const supabase = getSupabase();
    await supabase.rpc("leave_room", { p_code: code });
  }, [code]);

  const me =
    state.players.find((p) => p.user_id === state.userId) ?? null;
  const opponent =
    state.players.find((p) => p.user_id !== state.userId) ?? null;

  return {
    ...state,
    me,
    opponent,
    resolvedMembership: !state.loading && state.userId !== null,
    refresh: fetchAll,
    joinRoom,
    setDigits,
    setRoomSettings,
    skipTurn,
    getHint,
    submitSecret,
    submitRandomSecret,
    makeGuess,
    rematch,
    leave,
  };
}
