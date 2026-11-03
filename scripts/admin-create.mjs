// Nomme un compte RÈRA existant super admin du back-office.
// Usage : npm run admin:create -- prenom@exemple.com
// La personne doit d'abord avoir créé son compte sur le site (/fr/account/sign-up).
// Ensuite, tous les autres membres s'ajoutent depuis le back-office (/fr/admin/team).
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // pas de .env.local : on utilise l'environnement courant
  }
}

loadEnvLocal();
const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage : npm run admin:create -- prenom@exemple.com");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL manquant (lancez `neon env pull`).");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const [user] = await sql`SELECT id::text AS id, name, email FROM neon_auth."user" WHERE lower(email) = ${email} LIMIT 1`;
if (!user) {
  console.error(`Aucun compte n'utilise ${email}. Créez d'abord le compte sur /fr/account/sign-up, puis relancez la commande.`);
  process.exit(1);
}

const [role] = await sql`SELECT id FROM admin_roles WHERE slug = 'super-admin'`;
if (!role) {
  console.error("Rôle super-admin introuvable : lancez d'abord `npm run db:migrate`.");
  process.exit(1);
}

await sql`
  INSERT INTO admin_members (user_id, role_id, added_by)
  VALUES (${user.id}, ${role.id}, 'cli')
  ON CONFLICT (user_id) DO UPDATE SET role_id = EXCLUDED.role_id, updated_at = now()
`;
await sql`
  INSERT INTO admin_audit_log (actor_id, actor_email, action, target_type, target_id, details)
  VALUES (${user.id}, ${user.email}, 'member.bootstrap', 'member', ${user.id}, '{}'::jsonb)
`;

console.log(`${user.name ?? user.email} (${user.email}) est maintenant super admin.`);
