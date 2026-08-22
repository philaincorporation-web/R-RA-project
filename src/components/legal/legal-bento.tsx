"use client";

import {
  Building2,
  User,
  Server,
  Mail,
  Shield,
  AlertTriangle,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/ui/aceternity/reveal";

const iconMap: Record<string, LucideIcon> = {
  building: Building2,
  user: User,
  server: Server,
  mail: Mail,
  shield: Shield,
  alert: AlertTriangle,
  link: Link2,
};

type LegalCard = {
  id: string;
  span: "md" | "lg" | "tall" | "hero";
  icon: string;
  title: string;
  items?: readonly { label: string; value: string }[];
  text?: string;
};

const spanClass: Record<LegalCard["span"], string> = {
  md: "sm:col-span-1 sm:row-span-1",
  lg: "sm:col-span-2 sm:row-span-1",
  tall: "sm:col-span-1 sm:row-span-2",
  hero: "sm:col-span-2 sm:row-span-2",
};

export function LegalBento({ cards }: { cards: readonly LegalCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:auto-rows-[minmax(160px,auto)] sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = iconMap[card.icon] ?? Building2;
        const isLarge = card.span === "hero" || card.span === "tall";

        return (
          <Reveal
            key={card.id}
            index={i}
            className={cn("h-full min-h-[160px]", spanClass[card.span])}
          >
            <article
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-2xl",
                "border border-rera-navy-100/70 bg-white/80 p-6 backdrop-blur-md",
                "shadow-sm transition-all duration-500 ease-out",
                "hover:-translate-y-1 hover:shadow-premium",
                "dark:border-white/[0.08] dark:bg-white/[0.06]",
                "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]",
                "dark:hover:border-rera-lagoon-400/30",
                "dark:hover:shadow-[0_20px_50px_-20px_rgba(32,178,201,0.35)]",
                isLarge && "p-7 sm:p-8"
              )}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rera-lagoon-400/0 blur-3xl transition-all duration-500 group-hover:bg-rera-lagoon-400/15 dark:group-hover:bg-rera-lagoon-400/20"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-rera-gold-400/0 blur-3xl transition-all duration-500 group-hover:bg-rera-gold-400/10 dark:group-hover:bg-rera-gold-400/15"
                aria-hidden
              />

              <div
                className={cn(
                  "relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl",
                  "border border-rera-navy-100 bg-rera-mist text-rera-navy-700",
                  "transition-all duration-300",
                  "group-hover:border-rera-lagoon-400/40 group-hover:bg-rera-lagoon-400/10 group-hover:text-rera-lagoon-600",
                  "dark:border-white/10 dark:bg-white/5 dark:text-rera-lagoon-300",
                  "dark:group-hover:border-rera-lagoon-400/40 dark:group-hover:bg-rera-lagoon-400/10 dark:group-hover:text-rera-lagoon-200",
                  "dark:group-hover:shadow-[0_0_20px_rgba(32,178,201,0.25)]"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>

              <h2
                className={cn(
                  "relative font-semibold tracking-tight text-rera-navy-900 dark:text-white",
                  isLarge ? "text-xl sm:text-2xl" : "text-lg"
                )}
              >
                {card.title}
              </h2>

              {card.items ? (
                <dl className="relative mt-4 flex flex-1 flex-col gap-3">
                  {card.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3"
                    >
                      <dt className="shrink-0 text-xs font-medium uppercase tracking-wider text-rera-navy-400 dark:text-rera-mist/45">
                        {item.label}
                      </dt>
                      <dd className="text-sm leading-relaxed text-rera-navy-700 dark:text-rera-mist/85">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {card.text ? (
                <p className="relative mt-3 flex-1 text-sm leading-relaxed text-rera-navy-600 dark:text-rera-mist/70">
                  {card.text}
                </p>
              ) : null}

              <div
                className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rera-lagoon-400/0 to-transparent transition-all duration-500 group-hover:via-rera-lagoon-400/50"
                aria-hidden
              />
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}