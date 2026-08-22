import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("container-rera", className)}>{children}</div>;
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-rera-gold-400/40 bg-rera-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rera-gold-700 dark:text-rera-gold-300",
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-rera-navy-800 dark:text-white sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-rera-navy-500 dark:text-rera-mist/70 sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("card-surface rounded-xl2 shadow-premium", className)}>{children}</div>
  );
}
