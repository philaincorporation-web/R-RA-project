"use client";

import { cn } from "@/lib/utils/cn";

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-rera-aurora",
        className
      )}
    >
      <div className="absolute left-1/4 top-0 h-72 w-72 animate-float rounded-full bg-rera-lagoon-400/20 blur-3xl" />
      <div className="absolute right-1/4 top-1/3 h-80 w-80 animate-float-delayed rounded-full bg-rera-emerald-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 animate-float rounded-full bg-rera-gold-400/15 blur-3xl" />
    </div>
  );
}
