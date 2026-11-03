import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2, CalendarCheck, Clock, History, Image as ImageIcon, Mail, ShieldCheck, UserRound, Users } from "lucide-react";
import { can, requireAdmin } from "@/lib/admin/server";
import { getRequestCounts } from "@/lib/admin/requests";
import { PERMISSION_GROUPS } from "@/lib/admin/permissions";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";

export default async function AdminDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ denied?: string }>;
}) {
  const { locale } = await params;
  const { denied } = await searchParams;
  const ctx = await requireAdmin(locale);
  const base = `/${locale}/admin`;
  const firstName = ctx.user.name.split(" ")[0] || ctx.user.email;

  const counts = await getRequestCounts();
  const toProcess = [
    { show: can(ctx, "reservations.view"), href: `${base}/reservations?status=pending`, icon: CalendarCheck, count: counts.bookings, label: "réservations en attente" },
    { show: can(ctx, "business.view"), href: `${base}/business?status=new`, icon: Building2, count: counts.business, label: "demandes Business nouvelles" },
    { show: can(ctx, "messages.view"), href: `${base}/messages?status=new`, icon: Mail, count: counts.messages, label: "messages nouveaux" },
  ].filter((t) => t.show);

  const modules = [
    { show: can(ctx, "team.manage"), href: `${base}/team`, icon: Users, title: "Équipe", text: "Ajoutez des membres et attribuez-leur un rôle." },
    { show: can(ctx, "roles.manage"), href: `${base}/roles`, icon: ShieldCheck, title: "Rôles", text: "Définissez ce que chaque rôle peut voir et modifier." },
    { show: can(ctx, "audit.view"), href: `${base}/activity`, icon: History, title: "Journal", text: "Retrouvez qui a modifié quoi, et quand." },
  ].filter((m) => m.show);

  // Modules prévus aux prochaines étapes de la migration vers Neon.
  const upcoming = [
    { show: can(ctx, "catalog.view") || can(ctx, "content.edit"), icon: ImageIcon, title: "Catalogue et contenus" },
    { show: can(ctx, "clients.view"), icon: UserRound, title: "Clients" },
  ].filter((m) => m.show);

  const myGroups = PERMISSION_GROUPS.map((g) => ({
    label: g.label,
    perms: g.permissions.filter((p) => ctx.permissions.includes(p.key)),
  })).filter((g) => g.perms.length > 0);

  return (
    <>
      <AdminPageHeader title={`Bonjour ${firstName}`} description={`Connecté en tant que ${ctx.role.name}.`} />

      {denied ? (
        <p role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Votre rôle ne donne pas accès à cette page. Demandez à un super admin si vous en avez besoin.
        </p>
      ) : null}

      {toProcess.length > 0 ? (
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {toProcess.map((t) => (
            <Link key={t.href} href={t.href} className="flex items-center gap-4 rounded-xl2 border border-rera-navy-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-premium">
              <t.icon className="h-7 w-7 shrink-0 text-rera-gold-600" />
              <p className="min-w-0 text-sm text-rera-navy-500">
                <span className="block font-heading text-3xl font-bold text-rera-navy-800">{t.count}</span>
                {t.label}
              </p>
            </Link>
          ))}
        </div>
      ) : null}

      {modules.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group rounded-xl2 border border-rera-navy-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-premium"
            >
              <m.icon className="h-6 w-6 text-rera-lagoon-600" />
              <p className="mt-4 flex items-center gap-2 font-heading text-lg font-semibold text-rera-navy-800">
                {m.title}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </p>
              <p className="mt-1 text-sm text-rera-navy-500">{m.text}</p>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {upcoming.length > 0 ? (
          <AdminCard>
            <h2 className="font-heading text-lg font-semibold text-rera-navy-800">Bientôt disponible</h2>
            <p className="mt-1 text-sm text-rera-navy-500">
              Ces modules arrivent avec la migration des données de Google Sheets vers Neon.
            </p>
            <ul className="mt-4 space-y-2">
              {upcoming.map((m) => (
                <li key={m.title} className="flex items-center gap-3 rounded-lg bg-rera-mist px-3 py-2.5 text-sm text-rera-navy-700">
                  <m.icon className="h-4 w-4 text-rera-navy-400" />
                  <span className="flex-1">{m.title}</span>
                  <Clock className="h-3.5 w-3.5 text-rera-navy-300" />
                </li>
              ))}
            </ul>
          </AdminCard>
        ) : null}

        <AdminCard>
          <h2 className="font-heading text-lg font-semibold text-rera-navy-800">Vos droits</h2>
          <p className="mt-1 text-sm text-rera-navy-500">
            {ctx.isSuperAdmin ? "En tant que super admin, vous avez accès à tout." : `Accordés par le rôle « ${ctx.role.name} ».`}
          </p>
          <dl className="mt-4 space-y-3">
            {myGroups.map((g) => (
              <div key={g.label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-rera-navy-400">{g.label}</dt>
                <dd className="mt-1 text-sm text-rera-navy-700">{g.perms.map((p) => p.label).join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </AdminCard>
      </div>
    </>
  );
}
