"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { useIsScrolled } from "@/hooks/use-scroll-position";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { AccountLink } from "@/components/navigation/account-link";

import { siteConfig } from "@/data";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface NavbarProps {
  locale: AppLocale;
  dict: Dictionary;
}

export function Navbar({ locale, dict }: NavbarProps) {
  const pathname = usePathname();
  const isScrolled = useIsScrolled();
  const [open, setOpen] = useState(false);

  /*
   * "dark" = navbar transparente posée sur la photo du hero :
   * texte blanc. Dès qu'on défile (ou menu mobile ouvert) : fond clair flouté.
   */
  const dark = !isScrolled && !open;

  const links = [
    { href: `/${locale}/discover`, label: dict.nav.discover },
    { href: `/${locale}/packages`, label: dict.nav.stays },
    { href: `/${locale}/activities`, label: dict.nav.activities },
    { href: `/${locale}/business`, label: dict.nav.business },
    { href: `/${locale}/history`, label: dict.nav.about },
  ];

  // Lien actif, y compris sur les sous-pages (/fr/activities/jet-ski → Activités).
  const activeHref = links.find(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`)
  )?.href;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 print:hidden transition-[background-color,box-shadow,border-color] duration-300",
        dark
          ? "border-b border-transparent bg-gradient-to-b from-rera-navy-950/50 to-transparent"
          : "border-b border-rera-navy-100/70 bg-white/85 shadow-[0_8px_30px_-12px_rgba(13,43,69,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-rera-navy-900/85"
      )}
    >
      <div
        className={cn(
          "container-rera flex items-center justify-between gap-6 transition-[height] duration-300",
          isScrolled ? "h-16" : "h-20"
        )}
      >
        {/* ===== Logo ===== */}
        <Link
          href={`/${locale}`}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label={`${siteConfig.name} — ${locale === "fr" ? "Accueil" : "Home"}`}
        >
          <Image
            src={siteConfig.images.logo}
            alt=""
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-full object-cover ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className={cn(
              "font-heading text-xl font-bold tracking-wide transition-colors",
              dark ? "text-white" : "text-rera-navy-800 dark:text-white"
            )}
          >
            {siteConfig.name}
          </span>
        </Link>

        {/* ===== Liens desktop ===== */}
        <nav aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"} className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-2">
            {links.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group/link relative block px-3 py-2 text-sm font-medium transition-colors",
                      dark
                        ? isActive
                          ? "text-white"
                          : "text-white/75 hover:text-white"
                        : isActive
                        ? "text-rera-navy-900 dark:text-white"
                        : "text-rera-navy-600 hover:text-rera-navy-900 dark:text-rera-mist/70 dark:hover:text-white"
                    )}
                  >
                    {link.label}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-rera-gold-gradient"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover/link:scale-x-100",
                          dark ? "bg-white/50" : "bg-rera-navy-200 dark:bg-white/30"
                        )}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ===== Actions desktop ===== */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <LanguageSwitcher locale={locale} dark={dark} />
          <AccountLink locale={locale} dark={dark} />
          <ThemeToggle dark={dark} />
          <Button href={`/${locale}/booking`} size="sm" className="ml-1">
            {dict.nav.book}
          </Button>
        </div>

        {/* ===== Bouton menu mobile ===== */}
        <button
          type="button"
          aria-label={open ? (locale === "fr" ? "Fermer le menu" : "Close menu") : locale === "fr" ? "Ouvrir le menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden",
            dark ? "text-white hover:bg-white/10" : "text-rera-navy-800 hover:bg-rera-navy-100/60 dark:text-white dark:hover:bg-white/10"
          )}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* ===== Menu mobile ===== */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-rera-navy-100/70 bg-white dark:border-white/10 dark:bg-rera-navy-900 lg:hidden"
          >
            <nav aria-label={locale === "fr" ? "Navigation mobile" : "Mobile navigation"} className="container-rera flex flex-col gap-1 pb-6 pt-3">
              {links.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                      isActive
                        ? "bg-rera-gold-50 text-rera-navy-900 dark:bg-white/10 dark:text-white"
                        : "text-rera-navy-700 hover:bg-rera-navy-100/60 dark:text-rera-mist dark:hover:bg-white/10"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn("h-5 w-0.5 rounded-full", isActive ? "bg-rera-gold-gradient" : "bg-transparent")}
                    />
                    {link.label}
                  </Link>
                );
              })}

              <AccountLink locale={locale} variant="row" onNavigate={() => setOpen(false)} />

              <div className="mt-3 flex items-center justify-between border-t border-rera-navy-100/70 px-3 pt-4 dark:border-white/10">
                <LanguageSwitcher locale={locale} />
                <ThemeToggle />
              </div>

              <Button href={`/${locale}/booking`} className="mt-4 w-full" onClick={() => setOpen(false)}>
                {dict.nav.book}
              </Button>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
