"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Pages de connexion / inscription : plein écran, sans la navbar ni le footer du site. */
export const AUTH_PATH = /^\/[a-z]{2}\/account\/sign-(in|up)\/?$/;

export function HideOnAuth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname && AUTH_PATH.test(pathname)) return null;
  return <>{children}</>;
}
