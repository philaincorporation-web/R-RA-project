"use client";

import { createAuthClient } from "@neon/auth/next";

/** Client Neon Auth pour les composants client (useSession, signOut…). Passe par /api/auth. */
export const authClient = createAuthClient();
