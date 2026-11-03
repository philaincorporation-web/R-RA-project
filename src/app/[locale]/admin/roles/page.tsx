import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Pencil, Plus } from "lucide-react";
import { listRoles, requireAdmin } from "@/lib/admin/server";
import { ALL_PERMISSIONS, permissionLabel } from "@/lib/admin/permissions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { adminButton } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Rôles" };

export default async function RolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale, "roles.manage");
  const roles = await listRoles();
  const base = `/${locale}/admin/roles`;

  return (
    <>
      <AdminPageHeader
        title="Rôles"
        description="Un rôle regroupe des permissions. Chaque membre de l'équipe a un seul rôle."
        actions={
          <Link href={`${base}/new`} className={adminButton("primary")}>
            <Plus className="h-4 w-4" />
            Nouveau rôle
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {roles.map((role) => {
          const perms = role.is_system ? ALL_PERMISSIONS : role.permissions;
          return (
            <article key={role.id} className="flex flex-col rounded-xl2 border border-rera-navy-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-rera-navy-800">
                    {role.name}
                    {role.is_system ? <Lock className="h-4 w-4 text-rera-gold-600" aria-label="Rôle protégé" /> : null}
                  </h2>
                  {role.description ? <p className="mt-1 text-sm text-rera-navy-500">{role.description}</p> : null}
                </div>
                <span className="shrink-0 rounded-full bg-rera-mist px-2.5 py-1 text-xs font-medium text-rera-navy-600">
                  {role.member_count} membre{role.member_count > 1 ? "s" : ""}
                </span>
              </div>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {role.is_system ? (
                  <li className="rounded-md bg-rera-gold-50 px-2 py-1 text-xs font-medium text-rera-gold-700">Tous les droits</li>
                ) : (
                  perms.map((p) => (
                    <li key={p} className="rounded-md bg-rera-lagoon-50 px-2 py-1 text-xs text-rera-lagoon-700">
                      {permissionLabel(p)}
                    </li>
                  ))
                )}
              </ul>

              {!role.is_system ? (
                <div className="mt-5 border-t border-rera-navy-100 pt-4">
                  <Link href={`${base}/${role.id}`} className={adminButton("secondary")}>
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </Link>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}
