/**
 * ============================================================
 *  RÈRA — Conditions générales (modifiables ici)
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

export const termsContent = {
  backgroundImage: "/conditionsgenerales.jpg",
  overlayOpacity: 0.45,

  fr: {
    eyebrow: "Conditions d'utilisation",
    title: "Conditions générales",
    subtitle:
      "Les règles applicables à l'utilisation du site RÈRA et à vos réservations.",
    cards: [
      {
        id: "object",
        span: "hero" as const,
        icon: "file-text",
        title: "Objet",
        text: "Les présentes conditions générales encadrent l'utilisation du site RÈRA et la réservation de séjours, hébergements, activités et services proposés à Pointe Denis, Gabon. En utilisant le site ou en effectuant une réservation, vous acceptez ces conditions sans réserve.",
      },
      {
        id: "booking",
        span: "md" as const,
        icon: "calendar-check",
        title: "Réservation",
        text: "Toute réservation effectuée sur le site constitue une demande, soumise à confirmation par notre équipe. Un email ou appel de confirmation vous sera envoyé avant finalisation.",
      },
      {
        id: "pricing",
        span: "md" as const,
        icon: "banknote",
        title: "Tarifs",
        text: "Les prix affichés sont exprimés en Franc CFA (XAF) et peuvent être modifiés sans préavis pour les réservations futures. Le tarif applicable est celui en vigueur au moment de la confirmation.",
      },
      {
        id: "payment",
        span: "lg" as const,
        icon: "credit-card",
        title: "Paiement",
        text: "Aucun paiement n'est prélevé au moment de la réservation en ligne. Notre équipe vous contacte pour finaliser le règlement (sur place, virement bancaire, Mobile Money ou carte bancaire) selon les modalités convenues ensemble.",
      },
      {
        id: "cancellation",
        span: "md" as const,
        icon: "x-circle",
        title: "Annulation & remboursement",
        text: "Les conditions d'annulation et de remboursement (délais, pénalités éventuelles) vous seront communiquées lors de la confirmation de votre réservation et peuvent varier selon le type de séjour.",
      },
      {
        id: "business",
        span: "md" as const,
        icon: "briefcase",
        title: "RÈRA Business",
        text: "Les demandes de devis pour séminaires, forums et événements d'entreprise font l'objet d'un accord contractuel séparé, adapté à chaque projet.",
      },
      {
        id: "liability",
        span: "lg" as const,
        icon: "shield-alert",
        title: "Responsabilité",
        text: "RÈRA met tout en œuvre pour garantir la qualité des prestations proposées. RÈRA ne saurait toutefois être tenu responsable des événements indépendants de sa volonté (conditions météorologiques, force majeure, décisions de prestataires tiers).",
      },
      {
        id: "ip",
        span: "md" as const,
        icon: "shield",
        title: "Propriété intellectuelle",
        text: "Tous les contenus du site (textes, photos, logo RÈRA) sont protégés par le droit d'auteur. Toute reproduction sans autorisation préalable est interdite.",
      },
      {
        id: "law",
        span: "md" as const,
        icon: "gavel",
        title: "Droit applicable",
        text: "Les présentes conditions sont soumises au droit gabonais. Tout litige relève de la compétence exclusive des tribunaux gabonais.",
      },
    ],
  },
  en: {
    eyebrow: "Terms of use",
    title: "Terms & Conditions",
    subtitle: "The rules governing the use of the RÈRA website and your bookings.",
    cards: [
      {
        id: "object",
        span: "hero" as const,
        icon: "file-text",
        title: "Purpose",
        text: "These terms and conditions govern the use of the RÈRA website and the booking of stays, accommodation, activities and services offered in Pointe Denis, Gabon. By using the site or making a booking, you accept these terms in full.",
      },
      {
        id: "booking",
        span: "md" as const,
        icon: "calendar-check",
        title: "Booking",
        text: "Any booking made on the site constitutes a request, subject to confirmation by our team. A confirmation email or call will be sent to you before finalization.",
      },
      {
        id: "pricing",
        span: "md" as const,
        icon: "banknote",
        title: "Pricing",
        text: "Displayed prices are in CFA Francs (XAF) and may change without notice for future bookings. The applicable rate is the one in effect at the time of confirmation.",
      },
      {
        id: "payment",
        span: "lg" as const,
        icon: "credit-card",
        title: "Payment",
        text: "No payment is taken at the time of online booking. Our team will contact you to finalize payment (on site, bank transfer, Mobile Money or credit card) according to terms agreed together.",
      },
      {
        id: "cancellation",
        span: "md" as const,
        icon: "x-circle",
        title: "Cancellation & refunds",
        text: "Cancellation and refund conditions (timeframes, possible fees) will be communicated when your booking is confirmed and may vary depending on the type of stay.",
      },
      {
        id: "business",
        span: "md" as const,
        icon: "briefcase",
        title: "RÈRA Business",
        text: "Quote requests for seminars, forums and corporate events are subject to a separate contractual agreement, tailored to each project.",
      },
      {
        id: "liability",
        span: "lg" as const,
        icon: "shield-alert",
        title: "Liability",
        text: "RÈRA strives to ensure the quality of the services offered. However, RÈRA cannot be held liable for events beyond its control (weather conditions, force majeure, third-party provider decisions).",
      },
      {
        id: "ip",
        span: "md" as const,
        icon: "shield",
        title: "Intellectual property",
        text: "All content on the site (texts, photos, RÈRA logo) is protected by copyright. Any reproduction without prior authorization is prohibited.",
      },
      {
        id: "law",
        span: "md" as const,
        icon: "gavel",
        title: "Governing law",
        text: "These terms are governed by Gabonese law. Any dispute falls under the exclusive jurisdiction of the courts of Gabon.",
      },
    ],
  },
} as const;
