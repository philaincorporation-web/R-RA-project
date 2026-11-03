import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { db, isUuid } from "@/lib/db/sql";
import { ALL_PERMISSIONS, isPermission, SUPER_ADMIN_SLUG, type Permission } from "./permissions";

// ============================================================
//  Contexte de l'utilisateur connecté au back-office
// ============================================================

export interface AdminContext {
  user: { id: string; name: string; email: string };
  role: { id: string; slug: string; name: string };
  permissions: Permission[];
  isSuperAdmin: boolean;
}

/**
 * Membre de l'équipe connecté, ou null (non connecté, pas membre, base indisponible).
 * Mis en cache pour la durée de la requête (layout + page = une seule lecture).
 */
export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const rows = await db()`
      SELECT r.id, r.slug, r.name, r.permissions
        FROM admin_members m
        JOIN admin_roles r ON r.id = m.role_id
       WHERE m.user_id = ${user.id}
       LIMIT 1
    `;
    const row = rows[0] as { id: string; slug: string; name: string; permissions: string[] } | undefined;
    if (!row) return null;
    const isSuperAdmin = row.slug === SUPER_ADMIN_SLUG;
    return {
      user: { id: user.id, name: user.name ?? "", email: user.email ?? "" },
      role: { id: row.id, slug: row.slug, name: row.name },
      permissions: isSuperAdmin ? [...ALL_PERMISSIONS] : row.permissions.filter(isPermission),
      isSuperAdmin,
    };
  } catch (error) {
    console.error("[admin] lecture du rôle impossible", error);
    return null;
  }
});

export function can(ctx: AdminContext, permission: Permission) {
  return ctx.isSuperAdmin || ctx.permissions.includes(permission);
}

/**
 * Garde des pages du back-office.
 * Non connecté → page de connexion. Connecté sans accès → 404 (on ne révèle pas l'existence de l'admin).
 * Permission manquante → tableau de bord.
 */
export async function requireAdmin(locale: string, permission?: Permission): Promise<AdminContext> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/account/sign-in`);
  const ctx = await getAdminContext();
  if (!ctx) notFound();
  if (permission && !can(ctx, permission)) redirect(`/${locale}/admin?denied=1`);
  return ctx;
}

/** Garde des server actions : renvoie le contexte, ou null si l'action n'est pas autorisée. */
export async function authorize(permission: Permission): Promise<AdminContext | null> {
  const ctx = await getAdminContext();
  if (!ctx || !can(ctx, permission)) return null;
  return ctx;
}

/**
 * Anti-escalade : on ne peut attribuer (ou créer) un rôle que si l'on possède
 * déjà toutes ses permissions. Seul un super admin peut nommer un super admin.
 */
export function canGrant(ctx: AdminContext, role: { slug: string; permissions: string[] }) {
  if (ctx.isSuperAdmin) return true;
  if (role.slug === SUPER_ADMIN_SLUG) return false;
  return role.permissions.every((p) => ctx.permissions.includes(p as Permission));
}

// ============================================================
//  Journal d'activité
// ============================================================

export async function logAudit(
  ctx: AdminContext,
  action: string,
  target: { type: string; id: string },
  details: Record<string, unknown> = {}
) {
  try {
    await db()`
      INSERT INTO admin_audit_log (actor_id, actor_email, action, target_type, target_id, details)
      VALUES (${ctx.user.id}, ${ctx.user.email}, ${action}, ${target.type}, ${target.id}, ${JSON.stringify(details)}::jsonb)
    `;
  } catch (error) {
    // Le journal ne doit jamais bloquer l'action elle-même.
    console.error("[admin] journal non enregistré", error);
  }
}

export interface AuditEntry {
  id: string;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export async function listAudit(limit = 50, offset = 0): Promise<AuditEntry[]> {
  const rows = await db()`
    SELECT id::text, actor_email, action, target_type, target_id, details, created_at
      FROM admin_audit_log
     ORDER BY created_at DESC
     LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as AuditEntry[];
}

// ============================================================
//  Rôles
// ============================================================

export interface AdminRole {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
  member_count: number;
}

export async function listRoles(): Promise<AdminRole[]> {
  const rows = await db()`
    SELECT r.id, r.slug, r.name, r.description, r.permissions, r.is_system,
           (SELECT count(*)::int FROM admin_members m WHERE m.role_id = r.id) AS member_count
      FROM admin_roles r
     ORDER BY r.is_system DESC, r.created_at ASC
  `;
  return rows as AdminRole[];
}

export async function getRole(id: string): Promise<AdminRole | null> {
  if (!isUuid(id)) return null;
  const rows = await db()`
    SELECT r.id, r.slug, r.name, r.description, r.permissions, r.is_system,
           (SELECT count(*)::int FROM admin_members m WHERE m.role_id = r.id) AS member_count
      FROM admin_roles r
     WHERE r.id = ${id}
  `;
  return (rows[0] as AdminRole) ?? null;
}

export async function insertRole(input: { slug: string; name: string; description: string; permissions: string[] }) {
  const rows = await db()`
    INSERT INTO admin_roles (slug, name, description, permissions)
    VALUES (${input.slug}, ${input.name}, ${input.description || null}, ${input.permissions})
    RETURNING id
  `;
  return (rows[0] as { id: string }).id;
}

export async function updateRoleRow(id: string, input: { name: string; description: string; permissions: string[] }) {
  await db()`
    UPDATE admin_roles
       SET name = ${input.name}, description = ${input.description || null},
           permissions = ${input.permissions}, updated_at = now()
     WHERE id = ${id} AND is_system = false
  `;
}

export async function deleteRoleRow(id: string) {
  await db()`DELETE FROM admin_roles WHERE id = ${id} AND is_system = false`;
}

export async function roleSlugExists(slug: string) {
  const rows = await db()`SELECT 1 FROM admin_roles WHERE slug = ${slug}`;
  return rows.length > 0;
}

// ============================================================
//  Membres de l'équipe
// ============================================================

export interface AdminMember {
  user_id: string;
  name: string | null;
  email: string | null;
  role_id: string;
  role_slug: string;
  role_name: string;
  created_at: string;
}

export async function listMembers(): Promise<AdminMember[]> {
  const rows = await db()`
    SELECT m.user_id, u.name, u.email, r.id AS role_id, r.slug AS role_slug, r.name AS role_name, m.created_at
      FROM admin_members m
      JOIN admin_roles r ON r.id = m.role_id
      LEFT JOIN neon_auth."user" u ON u.id::text = m.user_id
     ORDER BY (r.slug = ${SUPER_ADMIN_SLUG}) DESC, m.created_at ASC
  `;
  return rows as AdminMember[];
}

export async function getMember(userId: string): Promise<AdminMember | null> {
  const rows = await db()`
    SELECT m.user_id, u.name, u.email, r.id AS role_id, r.slug AS role_slug, r.name AS role_name, m.created_at
      FROM admin_members m
      JOIN admin_roles r ON r.id = m.role_id
      LEFT JOIN neon_auth."user" u ON u.id::text = m.user_id
     WHERE m.user_id = ${userId}
  `;
  return (rows[0] as AdminMember) ?? null;
}

/** Compte Neon Auth correspondant à un e-mail (la personne doit s'être inscrite sur le site). */
export async function findAuthUserByEmail(email: string) {
  const rows = await db()`
    SELECT id::text AS id, name, email FROM neon_auth."user" WHERE lower(email) = lower(${email}) LIMIT 1
  `;
  return (rows[0] as { id: string; name: string | null; email: string }) ?? null;
}

export async function countSuperAdmins() {
  const rows = await db()`
    SELECT count(*)::int AS n FROM admin_members m JOIN admin_roles r ON r.id = m.role_id WHERE r.slug = ${SUPER_ADMIN_SLUG}
  `;
  return (rows[0] as { n: number }).n;
}

export async function insertMember(userId: string, roleId: string, addedBy: string) {
  await db()`INSERT INTO admin_members (user_id, role_id, added_by) VALUES (${userId}, ${roleId}, ${addedBy})`;
}

export async function updateMemberRole(userId: string, roleId: string) {
  await db()`UPDATE admin_members SET role_id = ${roleId}, updated_at = now() WHERE user_id = ${userId}`;
}

export async function deleteMember(userId: string) {
  await db()`DELETE FROM admin_members WHERE user_id = ${userId}`;
}
