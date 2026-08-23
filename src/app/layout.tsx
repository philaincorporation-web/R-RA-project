import type { ReactNode } from "react";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import NextTopLoader from "nextjs-toploader";
import { NavigationOverlay } from "@/components/navigation/navigation-overlay";

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
  <ThemeProvider>
    <NextTopLoader color="#1a0ea0" showSpinner={false} height={3} />
    <NavigationOverlay />
    <ServiceWorkerRegister />   {/* ← nouvelle ligne */}
    {children}
  </ThemeProvider>
</body>
    </html>
  );
}