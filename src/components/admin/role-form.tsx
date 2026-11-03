"use client";

import { useActionState } from "react";
import { deleteRoleAction, saveRoleAction } from "@/app/[locale]/admin/actions";
import { PERMISSION_GROUPS } from "@/lib/admin/permissions";
import { FormMessage, SubmitButton } from "./form-bits";
import { adminInput, adminLabel } from "./styles";

export function RoleForm({
  locale,
  role,
  grantable,
}: {
  locale: string;
  role?: { id: string; name: string; description: string | null; permissions: string[] };
  /** Permissions que l'utilisateur connecté peut attribuer (les autres sont grisées). */
  grantable: string[];
}) {
  const [state, action] = useActionState(saveRoleAction, null);
  const selected = new Set(role?.permissions ?? []);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {role ? <input type="hidden" name="roleId" value={role.id} /> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="role-name" className={adminLabel}>
            Nom du rôle
          </label>
          <input
            id="role-name"
            name="name"
            required
            minLength={2}
            maxLength={60}
            defaultValue={role?.name ?? ""}
            placeholder="Ex. Réceptionniste"
            className={adminInput}
          />
        </div>
        <div>
          <label htmlFor="role-description" className={adminLabel}>
            Description (facultatif)
          </label>
          <input
            id="role-description"
            name="description"
            maxLength={200}
            defaultValue={role?.description ?? ""}
            placeholder="À quoi sert ce rôle ?"
            className={adminInput}
          />
        </div>
      </div>

      <fieldset>
        <legend className={adminLabel}>Permissions</legend>
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.id} className="rounded-xl border border-rera-navy-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-rera-navy-400">{group.label}</p>
              <div className="mt-3 space-y-2.5">
                {group.permissions.map((p) => {
                  const allowed = grantable.includes(p.key);
                  return (
                    <label
                      key={p.key}
                      className={`flex items-start gap-2.5 text-sm ${allowed ? "text-rera-navy-700" : "text-rera-navy-300"}`}
                    >
                      <input
                        type="checkbox"
                        name="permissions"
                        value={p.key}
                        defaultChecked={selected.has(p.key)}
                        disabled={!allowed}
                        className="mt-0.5 h-4 w-4 rounded border-rera-navy-300 accent-rera-navy-700"
                      />
                      <span>{p.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <FormMessage state={state} />
      <SubmitButton>{role ? "Enregistrer les modifications" : "Créer le rôle"}</SubmitButton>
    </form>
  );
}

export function DeleteRoleForm({ locale, roleId, roleName }: { locale: string; roleId: string; roleName: string }) {
  const [state, action] = useActionState(deleteRoleAction, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="roleId" value={roleId} />
      <SubmitButton variant="danger" confirm={`Supprimer définitivement le rôle « ${roleName} » ?`}>
        Supprimer ce rôle
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
