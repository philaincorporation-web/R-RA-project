import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Container } from "@/components/ui/primitives";
import { siteConfig } from "@/data";

export function Footer({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  const { contact, social, images, name } = siteConfig;

  const navLinks = [
    { href: `/${locale}/discover`, label: dict.nav.discover },
    { href: `/${locale}/packages`, label: dict.nav.stays },
    { href: `/${locale}/activities`, label: dict.nav.activities },
    { href: `/${locale}/accommodation`, label: dict.accommodation.eyebrow },
    { href: `/${locale}/business`, label: dict.nav.business },
    { href: `/${locale}/history`, label: dict.nav.about },
    { href: `/${locale}/practical-info`, label: dict.pages.practicalInfo.title },
    { href: `/${locale}/contact`, label: dict.pages.contact.title },
  ];

  return (
    <footer className="relative overflow-hidden bg-rera-navy-900 text-rera-mist/80">
      <div className="pointer-events-none absolute inset-0 bg-rera-aurora opacity-40" />
      <Container className="relative py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Image
                src={images.logo}
                alt={name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="font-heading text-xl font-bold text-white">{name}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">{dict.footer.description}</p>
            <div className="mt-5 flex items-center gap-3">
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-rera-gold-400">
              {dict.footer.navigation}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-rera-gold-400">
              {dict.footer.contact}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rera-lagoon-400" />
                <span>{contact.address[locale]}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-rera-lagoon-400" />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-rera-lagoon-400" />
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-rera-gold-400">
              {dict.footer.legal}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/legal`} className="transition-colors hover:text-white">
                  {dict.footer.legalMentions}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="transition-colors hover:text-white">
                  {dict.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="transition-colors hover:text-white">
                  {dict.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row">
          <p>
            © {year} {name} — {dict.footer.rights}
          </p>
          <p className="text-rera-mist/50">{dict.meta.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
