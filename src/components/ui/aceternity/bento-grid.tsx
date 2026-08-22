import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function BentoGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function BentoItem({
  title,
  text,
  icon,
  className,
  span,
}: {
  title: string;
  text: string;
  icon?: React.ReactNode;
  className?: string;
  span?: "1" | "2";
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl2 border border-rera-navy-100/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium dark:border-white/10 dark:bg-rera-navy-800/60",
        span === "2" && "sm:col-span-2",
        className
      )}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rera-lagoon-400/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />
      {icon ? (
        <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rera-gold-gradient text-rera-navy-900 shadow-glow-gold">
          {icon}
        </div>
      ) : null}
      <h3 className="relative text-lg font-semibold text-rera-navy-800 dark:text-white">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-rera-navy-500 dark:text-rera-mist/70">{text}</p>
    </div>
  );
}
