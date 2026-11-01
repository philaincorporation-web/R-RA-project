import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

/**
 * Instance Neon Auth (Managed Better Auth) côté serveur.
 * Fournit getSession(), signIn/signUp/signOut et le handler de /api/auth/*.
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

/** Utilisateur connecté, ou null. Ne lève jamais d'erreur (le site reste navigable si Auth est indisponible). */
export async function getCurrentUser() {
  try {
    const { data: session } = await auth.getSession();
    return session?.user ?? null;
  } catch {
    return null;
  }
}
