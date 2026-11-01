import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ship, Sun, Wallet, Backpack, ShieldCheck, Phone } from "lucide-react";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";
import { BentoGrid, BentoItem } from "@/components/ui/aceternity/bento-grid";
import { Reveal } from "@/components/ui/aceternity/reveal";

const items = {
  fr: [
    { title: "Comment venir", text: "Navette maritime depuis Libreville, traversée d'environ 30 minutes, départs quotidiens.", icon: Ship },
    { title: "Climat", text: "Climat équatorial chaud et humide toute l'année. Saison sèche de juin à septembre.", icon: Sun },
    { title: "Monnaie & paiement", text: "Franc CFA (XAF). Cartes acceptées dans certains établissements, prévoir des espèces.", icon: Wallet },
    { title: "À prévoir", text: "Crème solaire, répulsif anti-moustiques, tenue légère et maillot de bain.", icon: Backpack },
    { title: "Santé & sécurité", text: "Vaccination fièvre jaune recommandée. Trousse de premiers secours disponible sur site.", icon: ShieldCheck },
    { title: "Contact & urgences", text: "Notre équipe RÈRA reste joignable pendant toute la durée de votre séjour.", icon: Phone },
  ],
  en: [
    { title: "How to get there", text: "Boat shuttle from Libreville, about a 30-minute crossing, daily departures.", icon: Ship },
    { title: "Climate", text: "Warm, humid equatorial climate year-round. Dry season from June to September.", icon: Sun },
    { title: "Currency & payment", text: "CFA Franc (XAF). Cards accepted at some venues, cash recommended.", icon: Wallet },
    { title: "What to bring", text: "Sunscreen, mosquito repellent, light clothing and swimwear.", icon: Backpack },
    { title: "Health & safety", text: "Yellow fever vaccination recommended. First-aid kit available on site.", icon: ShieldCheck },
    { title: "Contact & emergencies", text: "Our RÈRA team remains reachable throughout your stay.", icon: Phone },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return { title: dict.pages.practicalInfo.title, description: dict.pages.practicalInfo.subtitle };
}

export default async function PracticalInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const list = items[locale];

  return (
    <>
      <PageHero
        title={dict.pages.practicalInfo.title}
        subtitle={dict.pages.practicalInfo.subtitle}
        backgroundImages={["/navette.jpg"]}
      />
      <section className="bg-white py-20 dark:bg-rera-navy-800/40">
        <Container>
          <Reveal>
            <BentoGrid>
              {list.map((item) => (
                <BentoItem
                  key={item.title}
                  title={item.title}
                  text={item.text}
                  icon={<item.icon className="h-5 w-5" />}
                />
              ))}
            </BentoGrid>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
