"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarCheck, History, LayoutDashboard, Mail, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ICONS = {
  dashboard: LayoutDashboard,
  reservations: CalendarCheck,
  business: Building2,
  messages: Mail,
  team: Users,
  roles: ShieldCheck,
  activity: History,
};

export type AdminNavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean; badge?: number };

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation du back-office" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className={cn("h-4 w-4", active && "text-rera-gold-400")} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-rera-gold-400 px-2 py-0.5 text-xs font-bold text-rera-navy-900" aria-label={`${item.badge} à traiter`}>
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
