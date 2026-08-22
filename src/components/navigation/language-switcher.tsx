"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/lib/i18n/config";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

function swapLocale(pathname: string, target: AppLocale) {
  const segments = pathname.split("/");
  segments[1] = target;
  return segments.join("/") || `/${target}`;
}

export function LanguageSwitcher({ locale, dark }: { locale: AppLocale; dark?: boolean }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border px-1 py-1 text-xs font-semibold",
        dark ? "border-white/25 text-white" : "border-rera-navy-200/60 text-rera-navy-700 dark:border-white/15 dark:text-rera-mist"
      )}
    >
      {locales.map((l) => (
        <Link
          key={l}
          href={swapLocale(pathname, l)}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
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
