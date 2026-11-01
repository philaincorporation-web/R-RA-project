"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { BusinessRequestForm } from "@/components/business/business-request-form";
import { businessServices, type BusinessService } from "@/data/business-services";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function BusinessServices({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  const fr = locale === "fr";
  const [serviceId, setServiceId] = useState<BusinessService["id"] | "">("");
  const formRef = useRef<HTMLDivElement>(null);

  function requestQuote(id: BusinessService["id"]) {
    setServiceId(id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* ===== Les 6 rubriques ===== */}
      <section className="bg-rera-mist py-20 dark:bg-rera-navy-900">
        <div className="container-rera">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rera-gold-500">
              {fr ? "Nos prestations" : "Our services"}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-rera-navy-800 dark:text-white sm:text-4xl">
              {fr ? "Des prestations pensées pour chaque occasion" : "Services designed for every occasion"}
            </h2>
            <p className="mt-4 text-rera-navy-500 dark:text-rera-mist/70">
              {fr
                ? "Choisissez la formule qui correspond à votre projet : notre équipe construit avec vous une proposition sur mesure à Pointe-Denis."
                : "Pick the format that fits your project: our team builds a tailor-made proposal with you in Pointe-Denis."}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businessServices.map((s, i) => (
              <Reveal key={s.id} index={i % 3} className="h-full">
                <article className="group card-surface flex h-full flex-col overflow-hidden rounded-xl2 shadow-premium transition-transform duration-300 hover:-translate-y-1.5">
                  <div className="relative h-52 w-full overflow-hidden">
                    <Image
                      src={s.image}
                      alt={fr ? s.imageAlt.fr : s.imageAlt.en}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rera-navy-900/70 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-5 font-heading text-3xl font-bold text-white/90">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-heading text-xl font-semibold text-rera-navy-800 dark:text-white">
                      {fr ? s.title.fr : s.title.en}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-rera-lagoon-600 dark:text-rera-lagoon-300">
                      {fr ? s.short.fr : s.short.en}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-rera-navy-500 dark:text-rera-mist/70">
                      {fr ? s.description.fr : s.description.en}
                    </p>
                    <div className="mt-auto pt-6">
                      <Button size="sm" variant="secondary" className="w-full" onClick={() => requestQuote(s.id)}>
                        {fr ? "Demander un devis" : "Request a quote"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Formulaire de demande ===== */}
      <section className="relative isolate overflow-hidden bg-white py-20 dark:bg-rera-navy-900">
        {/* Photo d'ambiance derrière le formulaire, voilée pour garder les champs lisibles
            (voile blanc en mode clair, bleu nuit en mode sombre). */}
        <div className="absolute inset-0 -z-10" aria-hidden>
          <Image src="/images/bg-business-form.png" alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-white/70 dark:bg-rera-navy-900/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/70 dark:from-rera-navy-900/80 dark:to-rera-navy-900/80" />
        </div>
        <div ref={formRef} id="devis" className="container-rera scroll-mt-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rera-gold-500">RÈRA Business</p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-rera-navy-800 dark:text-white sm:text-4xl">
                {dict.business.formTitle}
              </h2>
              <p className="mt-4 text-rera-navy-500 dark:text-rera-mist/70">{dict.business.formSubtitle}</p>
            </div>
            <BusinessRequestForm locale={locale} dict={dict} serviceId={serviceId} onServiceChange={setServiceId} />
          </div>
        </div>
      </section>
    </>
  );
}
