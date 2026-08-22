/**
 * ============================================================
 *  RÈRA — Galerie d'images (modifiables ici)
 * ============================================================
 *  Ajoutez / supprimez / réordonnez les photos librement.
 *
 *  - src   : URL ou chemin local ("/images/...")
 *  - alt   : description (FR / EN)
 *  - span  : "row-span-2" pour une image plus haute, sinon ""
 */

export const galleryImages = [
  {
    src: "/baiedestortue.jpg",
    alt: { fr: "Plage de Pointe Denis", en: "Pointe Denis beach" },
    span: "row-span-2",
  },
  {
    src: "/tortue.jpg",
    alt: { fr: "Ciel bleu et océan", en: "Blue sky and ocean" },
    span: "",
  },
  {
    src: "/jetskie.jpg",
    alt: { fr: "Activités nautiques", en: "Water activities" },
    span: "",
  },
  {
    src: "/MBOLO.jpg",
    alt: { fr: "Nature et mangrove", en: "Nature and mangrove" },
    span: "",
  },
  {
    src: "/pointega2.jpg",
    alt: { fr: "Coucher de soleil", en: "Sunset" },
    span: "row-span-2",
  },
  {
    src: "/savana2.jpg",
    alt: { fr: "Hébergement premium", en: "Premium accommodation" },
    span: "",
  },
] as const;

export type GalleryImage = (typeof galleryImages)[number];
