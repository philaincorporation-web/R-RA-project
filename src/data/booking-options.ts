/** Moyens de paiement et options additionnelles du tunnel de réservation (partagés avec l'espace client). */

export const paymentMethods: { id: string; fr: string; en: string; logo?: string }[] = [
  { id: "airtel-money", fr: "Airtel Money", en: "Airtel Money", logo: "/payment-icons/airtelmoney.webp" },
  { id: "moov-money", fr: "Moov Money", en: "Moov Money", logo: "/payment-icons/moovmoney.webp" },
  { id: "card", fr: "Carte bancaire", en: "Credit card", logo: "/payment-icons/creditcard.jpg" },
  { id: "on-site", fr: "Paiement sur place", en: "Pay on site", logo: "/payment-icons/Paiementplace.jpg" },
  { id: "transfer", fr: "Virement bancaire", en: "Bank transfer", logo: "/payment-icons/bancaire.jpg" },
];

export const additionalOptions = [
  { id: "private-transfer", fr: "Transfert privatif", en: "Private transfer", price: 25000 },
  { id: "guided-tour", fr: "Visite guidée patrimoine", en: "Guided heritage tour", price: 15000 },
  { id: "photo-package", fr: "Reportage photo", en: "Photo package", price: 20000 },
];
