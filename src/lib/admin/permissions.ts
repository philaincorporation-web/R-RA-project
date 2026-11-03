/**
 * Catalogue des permissions du back-office RÈRA.
 * Pour ajouter une permission : l'ajouter ici, puis la cocher sur les rôles concernés
 * depuis /admin/roles (le super admin l'obtient automatiquement).
 */

export const PERMISSION_GROUPS = [
  {
    id: "reservations",
    label: "Réservations",
    permissions: [
      { key: "reservations.view", label: "Voir les réservations" },
      { key: "reservations.manage", label: "Gérer les réservations (statut, notes)" },
    ],
  },
  {
    id: "business",
    label: "Demandes Business",
    permissions: [
      { key: "business.view", label: "Voir les demandes Business" },
      { key: "business.manage", label: "Gérer les demandes Business" },
    ],
  },
  {
    id: "messages",
    label: "Messages de contact",
    permissions: [
      { key: "messages.view", label: "Voir les messages" },
      { key: "messages.manage", label: "Gérer les messages" },
    ],
  },
  {
    id: "catalog",
    label: "Catalogue",
    permissions: [
      { key: "catalog.view", label: "Voir le catalogue (séjours, activités, hébergements)" },
      { key: "catalog.edit", label: "Modifier le catalogue" },
    ],
  },
  {
    id: "content",
    label: "Contenus",
    permissions: [{ key: "content.edit", label: "Modifier les témoignages et textes du site" }],
  },
  {
    id: "clients",
    label: "Clients",
    permissions: [{ key: "clients.view", label: "Voir les comptes clients" }],
  },
  {
    id: "team",
    label: "Équipe",
    permissions: [{ key: "team.manage", label: "Ajouter, retirer des membres et leur attribuer un rôle" }],
  },
  {
    id: "roles",
    label: "Rôles",
    permissions: [{ key: "roles.manage", label: "Créer et modifier les rôles et leurs permissions" }],
  },
  {
    id: "audit",
    label: "Journal",
    permissions: [{ key: "audit.view", label: "Consulter le journal d'activité" }],
  },
] as const;

export type Permission = (typeof PERMISSION_GROUPS)[number]["permissions"][number]["key"];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));

export const SUPER_ADMIN_SLUG = "super-admin";

export function isPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as string[]).includes(value);
}

export function permissionLabel(key: string): string {
  for (const group of PERMISSION_GROUPS) {
    const found = group.permissions.find((p) => p.key === key);
    if (found) return found.label;
  }
  return key;
}
