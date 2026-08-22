"use client";

import Image from "next/image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils/cn";
import type { Testimonial } from "@/types";
import type { AppLocale } from "@/lib/i18n/config";
import { pick } from "@/lib/utils/format";
import { Star } from "lucide-react";

export function InfiniteMovingCards({
  items,
  locale,
  speed = "normal",
}: {
  items: Testimonial[];
  locale: AppLocale;
  speed?: "slow" | "normal" | "fast";
}) {
  const reduced = useReducedMotion();
  const duration = speed === "fast" ? "30s" : speed === "slow" ? "70s" : "50s";
  const track = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
      <div
        className={cn("flex w-max gap-6 py-4", !reduced && "animate-[scroll_linear_infinite]")}
        style={!reduced ? { animationDuration: duration } : undefined}
      >
        {track.map((item, i) => (
          <figure
            key={`${item.id}-${i}`}
            className="card-surface w-[320px] shrink-0 rounded-xl2 p-6 shadow-premium sm:w-[380px]"
          >
            <div className="mb-3 flex items-center gap-1 text-rera-gold-500">
              {Array.from({ length: item.rating }).map((_, idx) => (
                <Star key={idx} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-sm leading-relaxed text-rera-navy-700 dark:text-rera-mist/85">
              {pick(item.quote, locale)}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <Image
                src={item.avatar}
                alt={item.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-rera-navy-800 dark:text-white">{item.name}</p>
                <p className="text-xs text-rera-navy-400 dark:text-rera-mist/60">{pick(item.role, locale)}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
