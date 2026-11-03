import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/server";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { RoleForm } from "@/components/admin/role-form";

export const metadata: Metadata = { title: "Nouveau rôle" };

export default async function NewRolePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const ctx = await requireAdmin(locale, "roles.manage");

  return (
    <>
      <Link href={`/${locale}/admin/roles`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-rera-navy-500 hover:text-rera-navy-800">
        <ArrowLeft className="h-4 w-4" /> Rôles
      </Link>
      <AdminPageHeader title="Nouveau rôle" description="Donnez un nom au rôle et cochez ce qu'il permet de faire." />
      <AdminCard>
        <RoleForm locale={locale} grantable={ctx.permissions} />
      </AdminCard>
    </>
  );
}
