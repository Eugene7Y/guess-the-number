"use client";

import { useRef } from "react";

interface DigitInputProps {
  value: string;
  onChange: (value: string) => void;
  /** number of digit cells (3-6) */
  length?: number;
  disabled?: boolean;
  /** When true, characters are shown as dots (for entering your own secret). */
  mask?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}

/**
 * A digit entry that behaves well on mobile keyboards. Internally it is a
 * single numeric input rendered as N boxes, so paste, autofill and on-screen
 * keyboards all work reliably. The number of boxes follows the room's chosen
 * secret length.
 */
export default function DigitInput({
  value,
  onChange,
  length = 5,
  disabled,
  mask,
  autoFocus,
  ariaLabel = "secret number",
}: DigitInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cells = Array.from({ length }, (_, i) => value[i] ?? "");

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, length);
    onChange(digits);
  };

  return (
    <button
      type="button"
      className="relative block w-full"
      onClick={() => inputRef.current?.focus()}
      disabled={disabled}
      aria-hidden
      tabIndex={-1}
    >
      <input
        ref={inputRef}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        disabled={disabled}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
        maxLength={length}
      />
      <div className="flex justify-between gap-2">
        {cells.map((c, i) => {
          const filled = c !== "";
          return (
            <div
              key={i}
              className={[
                "flex h-14 flex-1 items-center justify-center rounded-xl border text-2xl font-bold tabular-nums transition",
                filled
                  ? "border-brand-500 bg-brand-500/10 text-white"
                  : "border-white/15 bg-white/5 text-white/30",
                disabled ? "opacity-60" : "",
              ].join(" ")}
            >
              {filled ? (mask ? "•" : c) : "·"}
            </div>
          );
        })}
      </div>
    </button>
  );
}
