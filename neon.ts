import { defineConfig } from "@neon/config/v1";

// Services Neon du projet RÈRA : Postgres (toujours présent) + Neon Auth (comptes utilisateurs).
export default defineConfig({
  auth: true,
});
