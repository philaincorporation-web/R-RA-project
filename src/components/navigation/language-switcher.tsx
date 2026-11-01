"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { locales } from "@/lib/i18n/config";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

function swapLocale(pathname: string, target: AppLocale, search = "") {
  const segments = pathname.split("/");
  segments[1] = target;
  const path = segments.join("/") || `/${target}`;
  return search ? `${path}?${search}` : path;
}

type Props = { locale: AppLocale; dark?: boolean; size?: "sm" | "lg" };

function Switcher({ locale, dark, size = "sm", search }: Props & { search?: string }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border px-1 py-1 font-semibold",
        size === "lg" ? "p-1.5 text-sm" : "text-xs",
        dark ? "border-white/25 text-white" : "border-rera-navy-200/60 text-rera-navy-700 dark:border-white/15 dark:text-rera-mist"
      )}
    >
      {locales.map((l) => (
        <Link
          key={l}
          href={swapLocale(pathname, l, search)}
          hrefLang={l}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-full uppercase transition-colors",
            size === "lg" ? "px-4 py-2" : "px-2.5 py-1",
            l === locale
              ? "bg-rera-gold-gradient text-rera-navy-900"
              : dark
              ? "hover:bg-white/10"
              : "hover:bg-rera-navy-100/70 dark:hover:bg-white/10"
          )}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}

/** Conserve les paramètres d'URL (ex. ?offer=…&type=… sur la réservation) lors du changement de langue. */
function SwitcherWithSearch(props: Props) {
  const searchParams = useSearchParams();
  return <Switcher {...props} search={searchParams.toString()} />;
}

export function LanguageSwitcher(props: Props) {
  return (
    <Suspense fallback={<Switcher {...props} />}>
      <SwitcherWithSearch {...props} />
    </Suspense>
  );
}
