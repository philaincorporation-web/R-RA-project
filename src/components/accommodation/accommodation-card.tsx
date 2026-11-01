import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import type { Accommodation } from "@/types";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatPrice, pick } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

export function AccommodationCard({
  item,
  locale,
  dict,
}: {
  item: Accommodation;
  locale: AppLocale;
  dict: Dictionary;
}) {
  return (
    <div className="group card-surface flex flex-col overflow-hidden rounded-xl2 shadow-premium transition-transform duration-300 hover:-translate-y-1.5 sm:flex-row">
      <div className="relative h-56 w-full shrink-0 overflow-hidden sm:h-auto sm:w-64">
        <Image
          src={item.image}
          alt={pick(item.name, locale)}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 256px"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-heading text-lg font-semibold text-rera-navy-800 dark:text-white">
            <Link href={`/${locale}/accommodation/${item.slug}`} className="hover:text-rera-lagoon-600 dark:hover:text-rera-lagoon-300">
              {pick(item.name, locale)}
            </Link>
          </h3>
          <div className="flex items-center gap-1 text-xs font-medium text-rera-navy-500 dark:text-rera-mist/60">
            <Users className="h-3.5 w-3.5" />
            {dict.accommodation.capacity}: {item.capacity}
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-rera-navy-500 dark:text-rera-mist/70">
          {pick(item.description, locale)}
        </p>
        <div className="mb-5 mt-3 flex flex-wrap gap-2">
          {item.amenities.map((a) => (
            <span
              key={pick(a, locale)}
              className="rounded-full bg-rera-lagoon-50 px-3 py-1 text-xs font-medium text-rera-lagoon-700 dark:bg-white/10 dark:text-rera-lagoon-200"
            >
              {pick(a, locale)}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-rera-navy-100/60 pt-4 dark:border-white/10">
          <span className="text-lg font-bold text-rera-navy-800 dark:text-white">
            {formatPrice(item.price, item.currency, locale)}
            <span className="ml-1 text-xs font-normal text-rera-navy-400 dark:text-rera-mist/50">
              {dict.accommodation.perNight}
            </span>
          </span>
          <Button href={`/${locale}/booking?offer=${item.slug}&type=accommodation`} size="sm">
            {dict.accommodation.cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
