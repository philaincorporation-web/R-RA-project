import type { ReactNode } from "react";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import NextTopLoader from "nextjs-toploader";
import { NavigationOverlay } from "@/components/navigation/navigation-overlay";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
<html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)}>
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
    <NextTopLoader color="#20B2C9" showSpinner={false} height={3} />
    <NavigationOverlay />
    <ServiceWorkerRegister />   {/* ← nouvelle ligne */}
    {children}
  </ThemeProvider>
</body>
    </html>
  );
}