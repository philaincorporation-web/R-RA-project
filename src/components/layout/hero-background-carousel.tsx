"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type HeroBackgroundCarouselProps = {
  images: string[];
  overlayOpacity?: number;
  intervalMs?: number;
};

export function HeroBackgroundCarousel({
  images,
  overlayOpacity = 0.55,
  intervalMs = 5000,
}: HeroBackgroundCarouselProps) {
  const [index, setIndex] = useState(0);
  const list = images.filter(Boolean);

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [list.length, intervalMs]);

  if (list.length === 0) {
    return (
      <div className="absolute inset-0 bg-rera-gradient" aria-hidden>
        <div className="absolute inset-0 bg-rera-aurora opacity-40" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {list.map((src, i) => (
        <div
          key={src + i}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}
            <div
        className="absolute inset-0 bg-gradient-to-t from-rera-navy-950 via-rera-navy-900/80 to-rera-navy-900/30"
        style={{ opacity: overlayOpacity }}
      />
      <div className="absolute inset-0 bg-rera-aurora opacity-30" />
    </div>
  );
}