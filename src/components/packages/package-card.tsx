import Image from "next/image";
import Link from "next/link";
import { Check, Clock } from "lucide-react";
import type { Package } from "@/types";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatPrice, pick } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";

export function PackageCard({
  pkg,
  locale,
  dict,
}: {
  pkg: Package;
  locale: AppLocale;
  dict: Dictionary;
}) {
  const isCustom = pkg.durationDays === 0;

  return (
    <div className="group card-surface flex flex-col overflow-hidden rounded-xl2 shadow-premium transition-transform duration-300 hover:-translate-y-1.5">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src="/plagebleu.jpg"
          alt={pick(pkg.name, locale)}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rera-navy-900/70 via-transparent to-transparent" />
        {pkg.badge ? (
          <div className="absolute left-4 top-4">
            <Badge className="border-white/40 bg-rera-navy-900/60 text-white backdrop-blur-sm">
              {pick(pkg.badge, locale)}
            </Badge>
          </div>
        ) : null}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white/90">
          <Clock className="h-3.5 w-3.5" />
          {isCustom ? dict.packages.custom : `${pkg.durationDays} ${dict.packages.days} · ${pkg.nights} ${dict.packages.nights}`}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-semibold text-rera-navy-800 dark:text-white">
          {pick(pkg.name, locale)}
        </h3>
        <p className="mt-1 text-sm text-rera-lagoon-600 dark:text-rera-lagoon-300">{pick(pkg.tagline, locale)}</p>
        <p className="mt-3 text-sm leading-relaxed text-rera-navy-500 dark:text-rera-mist/70">
          {pick(pkg.description, locale)}
        </p>

        <ul className="mt-4 space-y-2">
          {pkg.inclusions.slice(0, 3).map((inc) => (
            <li key={pick(inc, locale)} className="flex items-start gap-2 text-sm text-rera-navy-600 dark:text-rera-mist/80">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-rera-emerald-500" />
              {pick(inc, locale)}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-end justify-between border-t border-rera-navy-100/60 pt-5 dark:border-white/10">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-rera-navy-400 dark:text-rera-mist/50">
              {isCustom ? "" : dict.packages.from}
            </p>
            <p className="text-xl font-bold text-rera-navy-800 dark:text-white">
              {formatPrice(pkg.price, pkg.currency, locale)}
            </p>
          </div>
          <Link
            href={`/${locale}/packages/${pkg.slug}`}
            className="text-sm font-semibold text-rera-lagoon-600 transition-colors hover:text-rera-lagoon-700 dark:text-rera-lagoon-300"
          >
            {dict.packages.cta} →
          </Link>
        </div>
        <Button href={`/${locale}/booking?offer=${pkg.slug}&type=package`} className="mt-4 w-full" size="sm">
          {dict.packages.bookCta}
        </Button>
      </div>
    </div>
  );
}
