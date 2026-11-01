/**
 * ============================================================
 *  RÈRA — Politique de confidentialité (modifiable ici)
 * ============================================================
 *
 *  backgroundImage : image de fond (URL ou "/images/...")
 *                    mets "" pour désactiver
 *  span :
 *    - "md"   → 1 colonne
 *    - "lg"   → 2 colonnes
 *    - "tall" → 1 colonne, 2 rangées
 *    - "hero" → 2 colonnes, 2 rangées
 */

export const privacyContent = {
  backgroundImage: "/confidentialite.jpg",
  overlayOpacity: 0.45,

  fr: {
    eyebrow: "Vie privée",
    title: "Confidentialité",
    subtitle:
      "Comment RÈRA collecte, utilise et protège vos données personnelles.",
    cards: [
      {
        id: "data-collected",
        span: "hero" as const,
        icon: "database",
        title: "Données collectées",
        items: [
          { label: "Identité", value: "Nom, prénom" },
          { label: "Contact", value: "Email, téléphone, pays de résidence" },
          { label: "Réservation", value: "Dates, voyageurs, options choisies, notes" },
          { label: "Entreprise (RÈRA Business)", value: "Société, contact, type d'événement" },
        ],
      },
      {
        id: "purpose",
        span: "md" as const,
        icon: "target",
        title: "Finalité du traitement",
        text: "Vos données sont utilisées exclusivement pour traiter vos réservations, répondre à vos demandes de devis Business et vos messages de contact — jamais à des fins publicitaires.",
      },
      {
        id: "retention",
        span: "md" as const,
        icon: "clock",
        title: "Durée de conservation",
        text: "Vos données sont conservées le temps nécessaire au traitement de votre demande, puis archivées ou supprimées conformément à nos obligations légales.",
      },
      {
        id: "sharing",
        span: "lg" as const,
        icon: "share",
        title: "Partage des données",
        text: "RÈRA ne vend ni ne partage vos données à des tiers à des fins commerciales. Elles transitent uniquement par nos prestataires techniques nécessaires au fonctionnement du site : Google Sheets / SheetDB (stockage des réservations) et Vercel Inc. (hébergement).",
      },
      {
        id: "cookies",
        span: "md" as const,
        icon: "cookie",
        title: "Cookies & stockage local",
        text: "Le site utilise uniquement un stockage local technique (préférence de thème clair/sombre, cache hors-ligne de l'application). Aucun cookie publicitaire ou traceur tiers n'est utilisé à ce jour.",
      },
      {
        id: "security",
        span: "md" as const,
        icon: "lock",
        title: "Sécurité",
        text: "Les échanges avec le site sont chiffrés (HTTPS). L'accès aux données de réservation est limité à l'équipe RÈRA.",
      },
      {
        id: "rights",
        span: "lg" as const,
        icon: "user-check",
        title: "Vos droits",
        text: "Conformément à la loi gabonaise n°001/2011 relative à la protection des données à caractère personnel, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, contactez-nous à l'adresse ci-dessous.",
      },
      {
        id: "contact",
        span: "md" as const,
        icon: "mail",
        title: "Nous contacter",
        items: [{ label: "Email", value: "contact@rera-pointedenis.com" }],
      },
    ],
  },
  en: {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    subtitle: "How RÈRA collects, uses, and protects your personal data.",
    cards: [
      {
        id: "data-collected",
        span: "hero" as const,
        icon: "database",
        title: "Data we collect",
        items: [
          { label: "Identity", value: "First and last name" },
          { label: "Contact", value: "Email, phone, country of residence" },
          { label: "Booking", value: "Dates, travelers, selected options, notes" },
          { label: "Business (RÈRA Business)", value: "Company, contact, event type" },
        ],
      },
      {
        id: "purpose",
        span: "md" as const,
        icon: "target",
        title: "Purpose of processing",
        text: "Your data is used solely to process your bookings, respond to Business quote requests and contact messages — never for advertising purposes.",
      },
      {
        id: "retention",
        span: "md" as const,
        icon: "clock",
        title: "Retention period",
        text: "Your data is kept for as long as necessary to process your request, then archived or deleted in accordance with our legal obligations.",
      },
      {
        id: "sharing",
        span: "lg" as const,
        icon: "share",
        title: "Data sharing",
        text: "RÈRA does not sell or share your data with third parties for commercial purposes. It only passes through the technical providers required to run the site: Google Sheets / SheetDB (booking storage) and Vercel Inc. (hosting).",
      },
      {
        id: "cookies",
        span: "md" as const,
        icon: "cookie",
        title: "Cookies & local storage",
        text: "The site only uses technical local storage (light/dark theme preference, offline app cache). No advertising cookie or third-party tracker is currently used.",
      },
      {
        id: "security",
        span: "md" as const,
        icon: "lock",
        title: "Security",
        text: "All exchanges with the site are encrypted (HTTPS). Access to booking data is restricted to the RÈRA team.",
      },
      {
        id: "rights",
        span: "lg" as const,
        icon: "user-check",
        title: "Your rights",
        text: "In accordance with Gabonese law n°001/2011 on the protection of personal data, you have the right to access, rectify, and delete your data. To exercise it, contact us at the address below.",
      },
      {
        id: "contact",
        span: "md" as const,
        icon: "mail",
        title: "Contact us",
        items: [{ label: "Email", value: "contact@rera-pointedenis.com" }],
      },
    ],
  },
} as const;
