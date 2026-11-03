"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Pages plein écran qui ont leur propre en-tête : connexion / inscription et back-office.
 * La navbar et le footer du site n'y sont pas affichés.
 */
const FULLSCREEN_PATH = /^\/[a-z]{2}\/(account\/sign-(in|up)|admin)(\/.*)?$/;

export function HideSiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname && FULLSCREEN_PATH.test(pathname)) return null;
  return <>{children}</>;
}
