import type { ReactNode } from "react";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";

/**
 * Les polices Poppins (titres) et Inter (corps de texte) sont chargées via
 * Google Fonts en <link> plutôt que via `next/font/google`, afin de ne pas
 * dépendre d'un accès réseau à fonts.googleapis.com au moment du build
 * (utile en environnement CI/sandbox sans sortie réseau). Pour une
 * optimisation maximale en production, vous pouvez migrer vers
 * `next/font/google` (Poppins/Inter) dès que l'environnement de build a
 * accès à Internet — voir README.md.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
