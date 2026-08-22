"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useIsScrolled } from "@/hooks/use-scroll-position";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { siteConfig } from "@/data";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function Navbar({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  const isScrolled = useIsScrolled();
  const [open, setOpen] = useState(false);
  const dark = !isScrolled && !open;

  const links = [
    { href: `/${locale}/discover`, label: dict.nav.discover },
    { href: `/${locale}/packages`, label: dict.nav.stays },
    { href: `/${locale}/activities`, label: dict.nav.activities },
    { href: `/${locale}/business`, label: dict.nav.business },
    { href: `/${locale}/history`, label: dict.nav.about },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isScrolled || open
          ? "bg-white/90 shadow-sm backdrop-blur-md dark:bg-rera-navy-900/90"
          : "bg-transparent"
      )}
    >
      <div className="container-rera flex h-20 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image
            src={siteConfig.images.logo}
            alt={siteConfig.name}
            width={44}
            height={44}
            className="h-10 w-10 rounded-lg object-cover"
            priority
          />
          <span className={cn("font-heading text-xl font-bold", dark ? "text-white" : "text-rera-navy-800 dark:text-white")}>
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                dark
                  ? "text-white/90 hover:text-white"
                  : "text-rera-navy-600 hover:text-rera-navy-900 dark:text-rera-mist/85 dark:hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} dark={dark} />
          <ThemeToggle dark={dark} />
          <Button href={`/${locale}/booking`} size="sm">
            {dict.nav.book}
          </Button>
        </div>

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full lg:hidden",
            dark ? "text-white" : "text-rera-navy-800 dark:text-white"
          )}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-white dark:bg-rera-navy-900 lg:hidden"
          >
            <div className="container-rera flex flex-col gap-1 pb-6 pt-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-rera-navy-700 hover:bg-rera-navy-100/60 dark:text-rera-mist dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex items-center justify-between px-3">
                <LanguageSwitcher locale={locale} />
                <ThemeToggle />
              </div>
              <Button href={`/${locale}/booking`} className="mt-4 w-full" onClick={() => setOpen(false)}>
                {dict.nav.book}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
