"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Tap/hover tooltip that works on touch and desktop. Wraps any trigger and
 * shows a small popover with explanatory text.
 */
export default function Tooltip({
  text,
  children,
}: {
  text: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <span
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-lg border border-white/15 bg-[#0b1020] px-3 py-2 text-xs leading-snug text-white/90 shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}

/** A small "?" info chip that shows a tooltip — handy next to labels/buttons. */
export function InfoDot({ text }: { text: string }) {
  return (
    <Tooltip text={text}>
      <span className="ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-white/25 text-[10px] font-bold text-white/60">
        ?
      </span>
    </Tooltip>
  );
}
