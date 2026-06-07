"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/25",
    ghost: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
    danger: "bg-red-600/90 text-white hover:bg-red-500",
  } as const;
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`animate-fade-in rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-white/70">
      {children}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-brand-500 focus:bg-white/10 ${props.className ?? ""}`}
    />
  );
}

export function StatusDot({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        online ? "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/70" : "bg-white/25"
      }`}
      title={online ? "Online" : "Offline"}
    />
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="animate-pop rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {message}
    </div>
  );
}
