"use client";

import { useEffect, useState } from "react";
import { useT } from "./I18nProvider";

/**
 * Invite controls: shareable link, copy, native share, and a QR code the
 * opponent can scan to join — no account or login needed.
 */
export default function InviteShare({ code }: { code: string }) {
  const t = useT();
  const [qr, setQr] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);

  const url =
    typeof window !== "undefined" ? `${window.location.origin}/room/${code}` : "";

  useEffect(() => {
    if (!show || !url) return;
    let alive = true;
    import("qrcode")
      .then((QR) =>
        QR.toDataURL(url, { width: 220, margin: 1, color: { dark: "#0b1020", light: "#ffffff" } })
      )
      .then((d) => alive && setQr(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [show, url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Guess the Number", text: t("rv_share_text", { code }), url });
        return;
      }
    } catch {
      /* fall through */
    }
    copy();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={share}
          className="rounded-xl border border-white/15 bg-white/5 px-2 py-2 text-sm font-semibold text-white transition active:scale-95"
        >
          📤 {t("inv_share")}
        </button>
        <button
          onClick={copy}
          className="rounded-xl border border-white/15 bg-white/5 px-2 py-2 text-sm font-semibold text-white transition active:scale-95"
        >
          {copied ? t("rv_copied") : `🔗 ${t("inv_copy")}`}
        </button>
        <button
          onClick={() => setShow((s) => !s)}
          className="rounded-xl border border-white/15 bg-white/5 px-2 py-2 text-sm font-semibold text-white transition active:scale-95"
        >
          {show ? t("inv_hide_qr") : `📱 ${t("inv_qr")}`}
        </button>
      </div>
      {show && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR code to join the room" className="rounded-lg" width={200} height={200} />
          ) : (
            <div className="h-[200px] w-[200px] animate-pulse rounded-lg bg-white/10" />
          )}
          <p className="text-center text-xs text-white/50">
            {t("inv_scan")}
          </p>
        </div>
      )}
    </div>
  );
}
