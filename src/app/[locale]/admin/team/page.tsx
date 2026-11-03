import type { Metadata } from "next";
import { canGrant, listMembers, listRoles, requireAdmin } from "@/lib/admin/server";
import { SUPER_ADMIN_SLUG } from "@/lib/admin/permissions";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { AddMemberForm } from "@/components/admin/add-member-form";
import { MemberActions } from "@/components/admin/member-actions";

export const metadata: Metadata = { title: "Équipe" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const ctx = await requireAdmin(locale, "team.manage");
  const [members, roles] = await Promise.all([listMembers(), listRoles()]);

  // Seuls les rôles que l'utilisateur a le droit d'attribuer sont proposés.
  const grantable = roles.filter((r) => canGrant(ctx, r)).map((r) => ({ id: r.id, name: r.name }));

  return (
    <>
      <AdminPageHeader
        title="Équipe"
        description="Les personnes qui ont accès au back-office. Pour ajouter quelqu'un, il doit d'abord avoir créé son compte sur le site."
      />

      <AdminCard className="mb-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-rera-navy-800">Ajouter un membre</h2>
        <AddMemberForm locale={locale} roles={grantable} />
      </AdminCard>

      <AdminCard className="p-0 sm:p-0">
        <div className="border-b border-rera-navy-100 px-5 py-4 sm:px-6">
          <h2 className="font-heading text-lg font-semibold text-rera-navy-800">
            Membres <span className="text-rera-navy-400">({members.length})</span>
          </h2>
        </div>
        <ul className="divide-y divide-rera-navy-100">
          {members.map((m) => {
            const isSelf = m.user_id === ctx.user.id;
            // Un super admin ne peut être modifié que par un autre super admin.
            const editable = !isSelf && (m.role_slug !== SUPER_ADMIN_SLUG || ctx.isSuperAdmin);
            return (
              <li key={m.user_id} className="flex flex-col gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-rera-navy-800">
                    {m.name || "Sans nom"}
                    {isSelf ? <span className="rounded-full bg-rera-lagoon-50 px-2 py-0.5 text-xs font-medium text-rera-lagoon-700">Vous</span> : null}
                  </p>
                  <p className="truncate text-sm text-rera-navy-500">{m.email ?? "Compte supprimé"}</p>
                  <p className="mt-1 text-xs text-rera-navy-400">
                    <span className="font-medium text-rera-navy-600">{m.role_name}</span> · membre depuis le {dateFmt.format(new Date(m.created_at))}
                  </p>
                </div>
                {editable ? (
                  <MemberActions locale={locale} userId={m.user_id} email={m.email ?? m.user_id} currentRoleId={m.role_id} roles={grantable} />
                ) : null}
              </li>
            );
          })}
        </ul>
      </AdminCard>
    </>
  );
}
