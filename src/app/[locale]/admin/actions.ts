"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { isUuid } from "@/lib/db/sql";
import { isPermission, SUPER_ADMIN_SLUG } from "@/lib/admin/permissions";
import {
  authorize,
  canGrant,
  countSuperAdmins,
  deleteMember,
  deleteRoleRow,
  findAuthUserByEmail,
  getMember,
  getRole,
  insertMember,
  insertRole,
  logAudit,
  roleSlugExists,
  updateMemberRole,
  updateRoleRow,
} from "@/lib/admin/server";

export type AdminFormState = { ok?: string; error?: string } | null;

const DENIED = { error: "Vous n'avez pas les droits nécessaires pour cette action." };
const FAILED = { error: "Une erreur est survenue. Réessayez dans un instant." };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function localeOf(fd: FormData) {
  const l = str(fd, "locale");
  return isValidLocale(l) ? l : "fr";
}

function refresh(fd: FormData) {
  revalidatePath(`/${localeOf(fd)}/admin`, "layout");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// ============================================================
//  Équipe
// ============================================================

export async function addMemberAction(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await authorize("team.manage");
  if (!ctx) return DENIED;

  const email = str(fd, "email").toLowerCase();
  const roleId = str(fd, "roleId");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Adresse e-mail invalide." };
  if (!isUuid(roleId)) return { error: "Choisissez un rôle." };

  try {
    const [user, role] = await Promise.all([findAuthUserByEmail(email), getRole(roleId)]);
    if (!user)
      return {
        error: "Aucun compte RÈRA n'utilise cet e-mail. La personne doit d'abord créer son compte sur le site.",
      };
    if (!role) return { error: "Ce rôle n'existe plus." };
    if (!canGrant(ctx, role)) return { error: "Vous ne pouvez pas attribuer un rôle qui a plus de droits que le vôtre." };
    if (await getMember(user.id)) return { error: "Cette personne fait déjà partie de l'équipe." };

    await insertMember(user.id, role.id, ctx.user.id);
    await logAudit(ctx, "member.add", { type: "member", id: user.id }, { email: user.email, role: role.name });
  } catch (error) {
    console.error("[admin] ajout membre", error);
    return FAILED;
  }
  refresh(fd);
  return { ok: `${email} a rejoint l'équipe.` };
}

export async function changeMemberRoleAction(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await authorize("team.manage");
  if (!ctx) return DENIED;

  const userId = str(fd, "userId");
  const roleId = str(fd, "roleId");
  if (!userId || !isUuid(roleId)) return { error: "Requête invalide." };
  if (userId === ctx.user.id) return { error: "Vous ne pouvez pas modifier votre propre rôle." };

  try {
    const [member, role] = await Promise.all([getMember(userId), getRole(roleId)]);
    if (!member) return { error: "Ce membre n'existe plus." };
    if (!role) return { error: "Ce rôle n'existe plus." };
    if (member.role_id === role.id) return { ok: "Aucun changement." };
    if (member.role_slug === SUPER_ADMIN_SLUG && !ctx.isSuperAdmin) return DENIED;
    if (!canGrant(ctx, role)) return { error: "Vous ne pouvez pas attribuer un rôle qui a plus de droits que le vôtre." };
    if (member.role_slug === SUPER_ADMIN_SLUG && (await countSuperAdmins()) <= 1)
      return { error: "Il doit toujours rester au moins un super admin." };

    await updateMemberRole(userId, role.id);
    await logAudit(ctx, "member.role", { type: "member", id: userId }, {
      email: member.email,
      from: member.role_name,
      to: role.name,
    });
  } catch (error) {
    console.error("[admin] changement de rôle", error);
    return FAILED;
  }
  refresh(fd);
  return { ok: "Rôle mis à jour." };
}

export async function removeMemberAction(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await authorize("team.manage");
  if (!ctx) return DENIED;

  const userId = str(fd, "userId");
  if (!userId) return { error: "Requête invalide." };
  if (userId === ctx.user.id) return { error: "Vous ne pouvez pas vous retirer vous-même de l'équipe." };

  try {
    const member = await getMember(userId);
    if (!member) return { ok: "Ce membre a déjà été retiré." };
    if (member.role_slug === SUPER_ADMIN_SLUG) {
      if (!ctx.isSuperAdmin) return DENIED;
      if ((await countSuperAdmins()) <= 1) return { error: "Il doit toujours rester au moins un super admin." };
    }
    await deleteMember(userId);
    await logAudit(ctx, "member.remove", { type: "member", id: userId }, { email: member.email, role: member.role_name });
  } catch (error) {
    console.error("[admin] retrait membre", error);
    return FAILED;
  }
  refresh(fd);
  return { ok: "Accès retiré." };
}

// ============================================================
//  Rôles
// ============================================================

export async function saveRoleAction(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await authorize("roles.manage");
  if (!ctx) return DENIED;

  const roleId = str(fd, "roleId");
  const name = str(fd, "name");
  const description = str(fd, "description");
  const permissions: string[] = [...new Set(fd.getAll("permissions").map(String).filter(isPermission))];

  if (name.length < 2 || name.length > 60) return { error: "Le nom du rôle doit contenir entre 2 et 60 caractères." };
  if (description.length > 200) return { error: "La description ne doit pas dépasser 200 caractères." };
  if (permissions.length === 0) return { error: "Cochez au moins une permission." };

  try {
    if (roleId) {
      const role = await getRole(roleId);
      if (!role) return { error: "Ce rôle n'existe plus." };
      if (role.is_system) return { error: "Le rôle Super admin ne peut pas être modifié." };
      // Il faut posséder les droits du rôle actuel ET ceux du rôle modifié.
      if (!canGrant(ctx, role) || !canGrant(ctx, { slug: role.slug, permissions }))
        return { error: "Vous ne pouvez pas donner à un rôle des droits que vous n'avez pas." };

      await updateRoleRow(role.id, { name, description, permissions });
      await logAudit(ctx, "role.update", { type: "role", id: role.id }, {
        name,
        added: permissions.filter((p) => !role.permissions.includes(p)),
        removed: role.permissions.filter((p) => !permissions.includes(p)),
      });
    } else {
      const base = slugify(name) || "role";
      if (base === SUPER_ADMIN_SLUG) return { error: "Ce nom est réservé." };
      if (!canGrant(ctx, { slug: base, permissions }))
        return { error: "Vous ne pouvez pas donner à un rôle des droits que vous n'avez pas." };
      let slug = base;
      for (let i = 2; await roleSlugExists(slug); i++) slug = `${base}-${i}`;

      const id = await insertRole({ slug, name, description, permissions });
      await logAudit(ctx, "role.create", { type: "role", id }, { name, permissions });
    }
  } catch (error) {
    console.error("[admin] enregistrement rôle", error);
    return FAILED;
  }
  refresh(fd);
  redirect(`/${localeOf(fd)}/admin/roles`);
}

export async function deleteRoleAction(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await authorize("roles.manage");
  if (!ctx) return DENIED;

  const roleId = str(fd, "roleId");
  try {
    const role = await getRole(roleId);
    if (!role) return { error: "Ce rôle n'existe plus." };
    if (role.is_system) return { error: "Le rôle Super admin ne peut pas être supprimé." };
    if (role.member_count > 0)
      return { error: `Ce rôle est attribué à ${role.member_count} membre(s). Changez d'abord leur rôle.` };
    if (!canGrant(ctx, role)) return DENIED;

    await deleteRoleRow(role.id);
    await logAudit(ctx, "role.delete", { type: "role", id: role.id }, { name: role.name });
  } catch (error) {
    console.error("[admin] suppression rôle", error);
    return FAILED;
  }
  refresh(fd);
  redirect(`/${localeOf(fd)}/admin/roles`);
}
