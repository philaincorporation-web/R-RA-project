"use client";

import { cn } from "@/lib/utils/cn";

/**
 * Effet "spotlight" radial statique en SVG, inspiré du langage visuel
 * Aceternity UI mais réimplémenté indépendamment pour RÈRA.
 */
export function Spotlight({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute -top-40 left-0 z-0 h-[140%] w-[120%] opacity-70 mix-blend-screen",
        className
      )}
      viewBox="0 0 1400 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#spotlight-blur)">
        <ellipse cx="420" cy="260" rx="360" ry="240" fill="#20B2C9" fillOpacity="0.45" />
        <ellipse cx="980" cy="180" rx="300" ry="220" fill="#4CC4A1" fillOpacity="0.35" />
        <ellipse cx="700" cy="520" rx="420" ry="260" fill="#F5CB6A" fillOpacity="0.18" />
      </g>
      <defs>
        <filter id="spotlight-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="120" />
        </filter>
      </defs>
    </svg>
  );
}
