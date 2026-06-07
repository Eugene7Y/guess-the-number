"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureSession, getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Button, Card, ErrorBanner, Label, TextInput } from "@/components/ui";
import { useT } from "@/components/I18nProvider";

export default function MultiplayerLobby() {
  const router = useRouter();
  const t = useT();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"home" | "join">("home");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("gtn-name");
    if (saved) setName(saved);
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setJoinCode(room.toUpperCase());
      setMode("join");
    }
  }, []);

  const persistName = (n: string) => {
    setName(n);
    window.localStorage.setItem("gtn-name", n);
  };

  const handleCreate = async () => {
    if (!name.trim()) return setError(t("lb_err_name"));
    setBusy(true);
    setError("");
    try {
      await ensureSession();
      const { data, error } = await getSupabase().rpc("create_room", {
        p_name: name.trim(),
      });
      if (error) throw new Error(error.message);
      router.push(`/room/${data}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("lb_err_create"));
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) return setError(t("lb_err_name"));
    if (joinCode.trim().length < 4) return setError(t("lb_err_code"));
    setBusy(true);
    setError("");
    try {
      await ensureSession();
      const { data, error } = await getSupabase().rpc("join_room", {
        p_code: joinCode.trim().toUpperCase(),
        p_name: name.trim(),
      });
      if (error) throw new Error(error.message);
      router.push(`/room/${data}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("rv_err_join"));
      setBusy(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col justify-center gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          {t("menu_multi")}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {t("lb_sub")}
        </p>
      </header>

      {!isSupabaseConfigured && (
        <ErrorBanner message="Supabase is not configured. Add your keys to .env.local (see README)." />
      )}

      <Card>
        <Label>{t("rv_your_name")}</Label>
        <TextInput
          value={name}
          onChange={(e) => persistName(e.target.value.slice(0, 20))}
          placeholder={t("lb_name_ph")}
          maxLength={20}
        />

        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} />
          </div>
        )}

        {mode === "home" ? (
          <div className="mt-5 flex flex-col gap-3">
            <Button onClick={handleCreate} disabled={busy}>
              {busy ? t("lb_creating") : t("lb_create")}
            </Button>
            <Button variant="ghost" onClick={() => setMode("join")} disabled={busy}>
              {t("lb_join_room")}
            </Button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            <div>
              <Label>{t("rh_room_code")}</Label>
              <TextInput
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="ABC123"
                className="text-center text-xl font-bold tracking-[0.3em]"
                autoCapitalize="characters"
                autoCorrect="off"
              />
            </div>
            <Button onClick={handleJoin} disabled={busy}>
              {busy ? t("rv_joining") : t("rv_join_btn")}
            </Button>
            <Button variant="ghost" onClick={() => setMode("home")} disabled={busy}>
              {t("tut_back")}
            </Button>
          </div>
        )}
      </Card>

      <button
        onClick={() => router.push("/")}
        className="text-center text-xs text-white/40 hover:text-white/70"
      >
        ← {t("b_back")}
      </button>
    </main>
  );
}
