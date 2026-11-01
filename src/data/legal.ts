/**
 * ============================================================
 *  RÈRA — Mentions légales (modifiables ici)
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

export const legalContent = {
   backgroundImage: "/mentionslegales.jpg",
  overlayOpacity: 0.45,
 

  fr: {
    eyebrow: "Informations légales",
    title: "Mentions légales",
    subtitle:
      "Transparence et conformité — les informations essentielles sur l’éditeur du site RÈRA.",
    cards: [
      {
        id: "editor",
        span: "hero" as const,
        icon: "building",
        title: "Éditeur du site",
        items: [
          { label: "Raison sociale", value: "RÈRA — Pointe Denis" },
          { label: "Forme juridique", value: "À compléter (SARL / SA / …)" },
          { label: "Siège social", value: "Pointe Denis, Estuaire, Gabon" },
          { label: "RCCM / NIF", value: "À compléter" },
        ],
      },
      {
        id: "director",
        span: "md" as const,
        icon: "user",
        title: "Directeur de publication",
        items: [
          { label: "Nom", value: "À compléter" },
          { label: "Qualité", value: "Gérant / Directeur" },
        ],
      },
      {
        id: "host",
        span: "md" as const,
        icon: "server",
        title: "Hébergeur",
        items: [
          { label: "Société", value: "Vercel Inc." },
          { label: "Adresse", value: "440 N Barranca Ave #4133, Covina, CA 91723, USA" },
          { label: "Site", value: "vercel.com" },
        ],
      },
      {
        id: "contact",
        span: "lg" as const,
        icon: "mail",
        title: "Contact",
        items: [
          { label: "Email", value: "contact@rera-pointedenis.com" },
          { label: "Téléphone", value: "+241 00 00 00 00" },
          { label: "Adresse", value: "Pointe Denis, Estuaire, Gabon" },
        ],
      },
      {
        id: "ip",
        span: "tall" as const,
        icon: "shield",
        title: "Propriété intellectuelle",
        text: "L’ensemble des contenus (textes, images, logos, vidéos) présents sur ce site est protégé par le droit d’auteur. Toute reproduction non autorisée est interdite.",
      },
      {
        id: "liability",
        span: "md" as const,
        icon: "alert",
        title: "Responsabilité",
        text: "RÈRA s’efforce d’assurer l’exactitude des informations diffusées. Toutefois, des erreurs ou omissions peuvent survenir. L’utilisateur reste responsable de l’usage qu’il fait des informations.",
      },
      {
        id: "links",
        span: "lg" as const,
        icon: "link",
        title: "Liens hypertextes",
        text: "Le site peut contenir des liens vers des sites tiers. RÈRA n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques.",
      },
    ],
  },
  en: {
    eyebrow: "Legal information",
    title: "Legal notice",
    subtitle:
      "Transparency and compliance — essential information about the publisher of the RÈRA website.",
    cards: [
      {
        id: "editor",
        span: "hero" as const,
        icon: "building",
        title: "Website publisher",
        items: [
          { label: "Company name", value: "RÈRA — Pointe Denis" },
          { label: "Legal form", value: "To be completed (LLC / …)" },
          { label: "Registered office", value: "Pointe Denis, Estuary, Gabon" },
          { label: "Registration / Tax ID", value: "To be completed" },
        ],
      },
      {
        id: "director",
        span: "md" as const,
        icon: "user",
        title: "Publication director",
        items: [
          { label: "Name", value: "To be completed" },
          { label: "Role", value: "Manager / Director" },
        ],
      },
      {
        id: "host",
        span: "md" as const,
        icon: "server",
        title: "Hosting provider",
        items: [
          { label: "Company", value: "Vercel Inc." },
          { label: "Address", value: "440 N Barranca Ave #4133, Covina, CA 91723, USA" },
          { label: "Website", value: "vercel.com" },
        ],
      },
      {
        id: "contact",
        span: "lg" as const,
        icon: "mail",
        title: "Contact",
        items: [
          { label: "Email", value: "contact@rera-pointedenis.com" },
          { label: "Phone", value: "+241 00 00 00 00" },
          { label: "Address", value: "Pointe Denis, Estuary, Gabon" },
        ],
      },
      {
        id: "ip",
        span: "tall" as const,
        icon: "shield",
        title: "Intellectual property",
        text: "All content on this website (texts, images, logos, videos) is protected by copyright. Unauthorized reproduction is prohibited.",
      },
      {
        id: "liability",
        span: "md" as const,
        icon: "alert",
        title: "Liability",
        text: "RÈRA strives to ensure the accuracy of the information published. However, errors or omissions may occur. Users remain responsible for how they use this information.",
      },
      {
        id: "links",
        span: "lg" as const,
        icon: "link",
        title: "Hyperlinks",
        text: "This website may contain links to third-party sites. RÈRA has no control over these sites and accepts no responsibility for their content or practices.",
      },
    ],
  },
} as const;