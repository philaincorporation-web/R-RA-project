import type { ReactNode } from "react";
import { getSiteUrl } from "@/lib/utils/site-url";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, locales, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/layout/footer";
import { HtmlLang } from "@/components/layout/html-lang";
import { HideSiteChrome } from "@/components/layout/hide-site-chrome";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0D2B45",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.defaultTitle, template: `%s — RÈRA` },
    description: dict.meta.defaultDescription,
    alternates: {
      canonical: `/${safeLocale}`,
      languages: { fr: "/fr", en: "/en" },
    },
    openGraph: {
      title: dict.meta.defaultTitle,
      description: dict.meta.defaultDescription,
      url: `${siteUrl}/${safeLocale}`,
      siteName: "RÈRA",
      locale: safeLocale === "fr" ? "fr_FR" : "en_US",
      type: "website",
      images: [{ url: "/images/logo.png", width: 1200, height: 1200, alt: "RÈRA — Pointe Denis" }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.defaultTitle,
      description: dict.meta.defaultDescription,
      images: ["/images/logo.png"],
    },
    icons: {
  icon: [
    { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
},
appleWebApp: {
  capable: true,
  statusBarStyle: "black-translucent",
  title: "RÈRA",
},
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <>
      <HtmlLang locale={locale} />
      <HideSiteChrome>
        <Navbar locale={locale} dict={dict} />
      </HideSiteChrome>
      <main className="min-h-[60svh]">{children}</main>
      <HideSiteChrome>
        <Footer locale={locale} dict={dict} />
      </HideSiteChrome>
    </>
  );
}
