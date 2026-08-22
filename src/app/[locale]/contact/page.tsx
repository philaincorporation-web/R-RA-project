import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";
import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/ui/aceternity/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return { title: dict.pages.contact.title, description: dict.pages.contact.subtitle };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <PageHero title={dict.pages.contact.title} subtitle={dict.pages.contact.subtitle} />
      <section className="bg-rera-mist py-20 dark:bg-rera-navy-900">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <Reveal className="space-y-6 lg:col-span-1">
              <div className="card-surface flex items-start gap-3 rounded-xl2 p-5 shadow-sm">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-rera-lagoon-500" />
                <div>
                  <p className="font-semibold text-rera-navy-800 dark:text-white">
                    {locale === "fr" ? "Adresse" : "Address"}
                  </p>
                  <p className="text-sm text-rera-navy-500 dark:text-rera-mist/70">Pointe Denis, Estuaire, Gabon</p>
                </div>
              </div>
              <div className="card-surface flex items-start gap-3 rounded-xl2 p-5 shadow-sm">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-rera-lagoon-500" />
                <div>
                  <p className="font-semibold text-rera-navy-800 dark:text-white">
                    {locale === "fr" ? "Téléphone" : "Phone"}
                  </p>
                  <p className="text-sm text-rera-navy-500 dark:text-rera-mist/70">+241 00 00 00 00</p>
                </div>
              </div>
              <div className="card-surface flex items-start gap-3 rounded-xl2 p-5 shadow-sm">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-rera-lagoon-500" />
                <div>
                  <p className="font-semibold text-rera-navy-800 dark:text-white">Email</p>
                  <p className="text-sm text-rera-navy-500 dark:text-rera-mist/70">contact@rera-pointedenis.com</p>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-2">
              <ContactForm locale={locale} dict={dict} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
