"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { siteConfig } from "@/data";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function Hero({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-rera-navy-900">
      <Image
        src="/images/bg-activities.jpg"
        alt="Pointe Denis, Gabon"
        fill
        priority
        className="object-cover opacity-60"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-rera-navy-900 via-rera-navy-900/60 to-rera-navy-900/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-rera-navy-900/80 via-transparent to-rera-navy-900/40" />
      <Spotlight />

      <motion.div
        aria-hidden
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[8%] top-[22%] hidden h-24 w-24 rounded-full border border-rera-gold-400/30 bg-rera-gold-400/10 backdrop-blur-sm sm:block"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute bottom-[18%] left-[6%] hidden h-16 w-16 rounded-full border border-rera-lagoon-300/30 bg-rera-lagoon-400/10 backdrop-blur-sm sm:block"
      />

      <div className="container-rera relative z-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm"
        >
          {dict.hero.eyebrow}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 max-w-3xl font-heading text-4xl font-bold leading-[1.08] text-white sm:text-6xl lg:text-7xl"
        >
          {dict.hero.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-white/80"
        >
          {dict.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Button href={`/${locale}/discover`} size="lg">
            {dict.hero.ctaPrimary}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href={`/${locale}/booking`} variant="outline" size="lg">
            <PlayCircle className="h-4 w-4" />
            {dict.hero.ctaSecondary}
          </Button>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70"
      >
        <span className="text-[11px] uppercase tracking-widest">{dict.hero.scroll}</span>
        <ChevronDown className="h-4 w-4" />
      </motion.div>
    </section>
  );
}
