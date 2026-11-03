import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getRole, requireAdmin } from "@/lib/admin/server";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { DeleteRoleForm, RoleForm } from "@/components/admin/role-form";

export const metadata: Metadata = { title: "Modifier un rôle" };

export default async function EditRolePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const ctx = await requireAdmin(locale, "roles.manage");
  const role = await getRole(id);
  if (!role || role.is_system) notFound();

  return (
    <>
      <Link href={`/${locale}/admin/roles`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-rera-navy-500 hover:text-rera-navy-800">
        <ArrowLeft className="h-4 w-4" /> Rôles
      </Link>
      <AdminPageHeader
        title={role.name}
        description={`${role.member_count} membre${role.member_count > 1 ? "s" : ""} avec ce rôle. Les changements s'appliquent immédiatement.`}
      />
      <AdminCard>
        <RoleForm locale={locale} role={role} grantable={ctx.permissions} />
      </AdminCard>

      <AdminCard className="mt-6 border-red-100">
        <h2 className="font-heading text-lg font-semibold text-rera-navy-800">Supprimer le rôle</h2>
        <p className="mb-4 mt-1 text-sm text-rera-navy-500">
          Possible uniquement si aucun membre n&apos;a ce rôle.
        </p>
        <DeleteRoleForm locale={locale} roleId={role.id} roleName={role.name} />
      </AdminCard>
    </>
  );
}
