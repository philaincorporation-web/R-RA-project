import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { isValidLocale } from "@/lib/i18n/config";
import { can, requireAdmin } from "@/lib/admin/server";
import { getRequestCounts } from "@/lib/admin/requests";
import { siteConfig } from "@/data";
import { AdminNav, type AdminNavItem } from "@/components/admin/admin-nav";
import { signOutAction } from "@/app/[locale]/account/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Administration RÈRA" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const ctx = await requireAdmin(locale);
  const base = `/${locale}/admin`;

  const items: AdminNavItem[] = [{ href: base, label: "Tableau de bord", icon: "dashboard", exact: true }];
  const counts = await getRequestCounts();
  if (can(ctx, "reservations.view")) items.push({ href: `${base}/reservations`, label: "Réservations", icon: "reservations", badge: counts.bookings });
  if (can(ctx, "business.view")) items.push({ href: `${base}/business`, label: "Demandes Business", icon: "business", badge: counts.business });
  if (can(ctx, "messages.view")) items.push({ href: `${base}/messages`, label: "Messages", icon: "messages", badge: counts.messages });
  if (can(ctx, "team.manage")) items.push({ href: `${base}/team`, label: "Équipe", icon: "team" });
  if (can(ctx, "roles.manage")) items.push({ href: `${base}/roles`, label: "Rôles", icon: "roles" });
  if (can(ctx, "audit.view")) items.push({ href: `${base}/activity`, label: "Journal", icon: "activity" });

  return (
    <div className="min-h-svh bg-rera-mist lg:flex">
      <aside className="bg-rera-navy-900 text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Link href={base} className="flex items-center gap-2.5">
            <Image src={siteConfig.images.logo} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-white/15" />
            <span className="leading-tight">
              <span className="block font-heading text-lg font-bold">{siteConfig.name}</span>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-white/50">Administration</span>
            </span>
          </Link>
          {/* Raccourcis mobiles (le bloc profil complet est en bas de la barre latérale sur desktop) */}
          <div className="flex items-center gap-1 lg:hidden">
            <Link href={`/${locale}`} aria-label="Voir le site" className="rounded-lg p-2 text-white/70 hover:bg-white/5 hover:text-white">
              <ExternalLink className="h-5 w-5" />
            </Link>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" aria-label="Se déconnecter" className="rounded-lg p-2 text-white/70 hover:bg-white/5 hover:text-white">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="px-3 pb-3 lg:flex-1 lg:pb-0">
          <AdminNav items={items} />
        </div>

        <div className="hidden border-t border-white/10 p-4 lg:block">
          <p className="truncate text-sm font-semibold">{ctx.user.name || ctx.user.email}</p>
          <p className="truncate text-xs text-white/50">{ctx.user.email}</p>
          <span className="mt-2 inline-flex rounded-full bg-rera-gold-400/15 px-2.5 py-0.5 text-xs font-semibold text-rera-gold-300">
            {ctx.role.name}
          </span>
          <div className="mt-4 flex flex-col gap-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
              <ExternalLink className="h-4 w-4" />
              Voir le site
            </Link>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
