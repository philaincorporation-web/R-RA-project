import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RÈRA — Pointe Denis, Gabon",
    short_name: "RÈRA",
    description:
      "RÈRA est la plateforme digitale premium dédiée à la découverte de Pointe Denis, Gabon : séjours, hébergements, activités et réservation en ligne.",
    start_url: "/fr",
    id: "/fr",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F2F6F8",
    theme_color: "#0D2B45",
    lang: "fr",
    dir: "ltr",
    categories: ["travel", "lifestyle", "business"],
    icons: [
      { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png", purpose: "any" },
      { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png", purpose: "any" },
      { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png", purpose: "any" },
      { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png", purpose: "any" },
      { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Réserver un séjour",
        short_name: "Réserver",
        description: "Accéder directement au parcours de réservation RÈRA",
        url: "/fr/booking",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Nos packages",
        short_name: "Packages",
        url: "/fr/packages",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}