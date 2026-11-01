"use client";

import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] === "en" ? "en" : "fr";
  const fr = locale === "fr";

  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden bg-rera-gradient pt-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-rera-aurora opacity-40" aria-hidden />
      <Container className="relative z-10 flex flex-col items-center text-center">
        <Compass className="h-12 w-12 text-rera-gold-400" aria-hidden />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-rera-gold-400">404</p>
        <h1 className="mt-3 font-heading text-3xl font-bold sm:text-5xl">
          {fr ? "Cette page s'est perdue en mer" : "This page got lost at sea"}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/80">
          {fr
            ? "La page demandée n'existe pas ou a été déplacée."
            : "The page you are looking for does not exist or has been moved."}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href={`/${locale}`} size="lg">
            {fr ? "Retour à l'accueil" : "Back to home"}
          </Button>
          <Button href={`/${locale}/packages`} variant="outline" size="lg">
            {fr ? "Voir les séjours" : "Browse stays"}
          </Button>
        </div>
      </Container>
    </section>
  );
}
