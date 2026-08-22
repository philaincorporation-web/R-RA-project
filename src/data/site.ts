/**
 * ============================================================
 *  RÈRA — Données de l'entreprise (modifiables ici)
 * ============================================================
 *  Changez librement les valeurs ci-dessous.
 *  Les images peuvent être :
 *    - une URL (Cloudinary, Unsplash, Imgur, etc.)
 *    - un chemin local : "/images/ma-photo.jpg" (mettre le fichier dans public/images/)
 */

export const siteConfig = {
  // ----- Identité -----
  name: "RÈRA",
  tagline: {
    fr: "Votre escapade commence ici.",
    en: "Your getaway starts here.",
  },

  // ----- Coordonnées (Footer, Contact, etc.) -----
  contact: {
    phone: "+241 74 75 86 90",
    email: "contact@rera-pointedenis.com",
    whatsapp: "+241 60 06 78 76", // format international sans espaces
    address: {
      fr: "Pointe Denis, Estuaire, Gabon",
      en: "Pointe Denis, Estuary, Gabon",
    },
  },

  // ----- Réseaux sociaux -----
  social: {
    facebook: "https://www.facebook.com/", // ← remplace par ton lien
    instagram: "https://www.instagram.com/", // ← remplace par ton lien
     tiktok: "https://www.tiktok.com/@rera",
     youtube: "https://www.youtube.com/@rera",
  },

  // ----- Images principales -----
  images: {
    /** Logo (utilisé dans la navbar et le footer) */
    logo: "/images/logo.png",

    /** Image de fond du Hero (page d'accueil) */
    hero: "/pointDenis.jpg",

    /** Image de la section Histoire (homepage) */
    history: "/pointDenis.jpg",
  },
} as const;

export type SiteConfig = typeof siteConfig;
