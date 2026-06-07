"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";
import { StatusDot } from "./ui";
import { useT } from "./I18nProvider";

export default function RoomHeader({
  code,
  me,
  opponent,
  onlineUserIds,
}: {
  code: string;
  me: Player | null;
  opponent: Player | null;
  onlineUserIds: Set<string>;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${code}`
      : "";

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Guess the Number",
          text: t("rv_share_text", { code }),
          url: shareUrl,
        });
        return;
      }
    } catch {
      // user cancelled share sheet — fall through to copy
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const PlayerChip = ({
    player,
    isMe,
  }: {
    player: Player | null;
    isMe: boolean;
  }) => {
    const online = player ? onlineUserIds.has(player.user_id) : false;
    const number = player ? (player.is_host ? t("rv_p1") : t("rv_p2")) : t("rv_p2");
    return (
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <StatusDot online={online} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">
            {player?.name ?? t("rv_waiting")}
            {isMe && (
              <span className="ml-1 text-[11px] font-normal text-brand-400">
                {t("rv_you")}
              </span>
            )}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-white/40">
            {number}
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-white/40">
            {t("rh_room_code")}
          </div>
          <div className="font-mono text-2xl font-extrabold tracking-[0.25em] text-white">
            {code}
          </div>
        </div>
        <button
          onClick={handleShare}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
        >
          {copied ? t("rv_copied") : t("rh_share")}
        </button>
      </div>

      <div className="flex items-stretch gap-2">
        <PlayerChip player={me} isMe />
        <PlayerChip player={opponent} isMe={false} />
      </div>
    </header>
  );
}
