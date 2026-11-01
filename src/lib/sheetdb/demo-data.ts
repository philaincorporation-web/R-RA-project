import type { Accommodation, Activity, Package, Testimonial } from "@/types";

/**
 * Données de démonstration utilisées uniquement en fallback lorsque
 * `SHEETDB_API_URL` n'est pas défini dans l'environnement. En production,
 * ces données proviennent exclusivement de Google Sheets via SheetDB.
 */

export const demoPackages: Package[] = [
  {
    id: "pkg-standard",
    slug: "standard",
    name: { fr: "Standard", en: "Standard" },
    tagline: { fr: "L'essentiel de Pointe Denis", en: "The essence of Pointe Denis" },
    description: {
      fr: "Une escapade de 2 jours pour découvrir les incontournables de Pointe Denis : plage, transfert et hébergement confortable.",
      en: "A 2-day getaway to discover the must-sees of Pointe Denis: beach, transfer and comfortable accommodation.",
    },
    durationDays: 2,
    nights: 1,
    price: 85000,
    currency: "XAF",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600&auto=format&fit=crop",
    inclusions: [
      { fr: "Navette maritime aller-retour", en: "Round-trip boat shuttle" },
      { fr: "1 nuitée en hébergement standard", en: "1 night in standard accommodation" },
      { fr: "Petit-déjeuner inclus", en: "Breakfast included" },
    ],
  },
  {
    id: "pkg-junior",
    slug: "junior",
    name: { fr: "Junior", en: "Junior" },
    tagline: { fr: "Confort et détente", en: "Comfort and relaxation" },
    description: {
      fr: "2 jours et 1 nuitée dans un cadre plus confortable, avec une activité incluse pour profiter pleinement du site.",
      en: "2 days and 1 night in a more comfortable setting, with one activity included to fully enjoy the site.",
    },
    durationDays: 2,
    nights: 1,
    price: 125000,
    currency: "XAF",
    image: "/skie.jpg",
    badge: { fr: "Populaire", en: "Popular" },
    featured: true,
    inclusions: [
      { fr: "Navette maritime aller-retour", en: "Round-trip boat shuttle" },
      { fr: "1 nuitée en hébergement confort", en: "1 night in comfort accommodation" },
      { fr: "1 activité incluse au choix", en: "1 included activity of your choice" },
      { fr: "Petit-déjeuner et déjeuner", en: "Breakfast and lunch" },
    ],
  },
  {
    id: "pkg-vip",
    slug: "vip",
    name: { fr: "VIP", en: "VIP" },
    tagline: { fr: "L'expérience premium", en: "The premium experience" },
    description: {
      fr: "2 jours et 1 nuitée dans nos hébergements les plus exclusifs, service personnalisé et activités haut de gamme.",
      en: "2 days and 1 night in our most exclusive accommodation, personalized service and premium activities.",
    },
    durationDays: 2,
    nights: 1,
    price: 220000,
    currency: "XAF",
    image: "/pointega.jpg",
    badge: { fr: "Premium", en: "Premium" },
    featured: true,
    inclusions: [
      { fr: "Navette privative aller-retour", en: "Private round-trip shuttle" },
      { fr: "1 nuitée en villa VIP", en: "1 night in a VIP villa" },
      { fr: "2 activités incluses au choix", en: "2 included activities of your choice" },
      { fr: "Pension complète", en: "Full board" },
      { fr: "Service de conciergerie", en: "Concierge service" },
    ],
  },
  {
    id: "pkg-vac",
    slug: "rera-vac",
    name: { fr: "RÈRA VAC", en: "RÈRA VAC" },
    tagline: { fr: "Le séjour immersif", en: "The immersive stay" },
    description: {
      fr: "6 jours et 5 nuitées pour vivre Pointe Denis en profondeur : nature, culture, détente et activités variées.",
      en: "6 days and 5 nights to fully experience Pointe Denis: nature, culture, relaxation and varied activities.",
    },
    durationDays: 6,
    nights: 5,
    price: 650000,
    currency: "XAF",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1600&auto=format&fit=crop",
    badge: { fr: "Immersion", en: "Immersion" },
    featured: true,
    inclusions: [
      { fr: "Navette maritime aller-retour", en: "Round-trip boat shuttle" },
      { fr: "5 nuitées en hébergement confort", en: "5 nights in comfort accommodation" },
      { fr: "Programme d'activités complet", en: "Full activity program" },
      { fr: "Pension complète", en: "Full board" },
      { fr: "Excursion patrimoine & histoire", en: "Heritage & history excursion" },
    ],
  },
 {
  id: "pkg-business",
  slug: "business-forum",
  image: "/baiedestortue.jpg",
  name: { fr: "Business & Forum", en: "Business & Forum" },
  tagline: {
    fr: "Sur mesure pour votre entreprise",
    en: "Tailor-made for your company",
  },
  description: {
    fr: "Un format entièrement personnalisé pour vos séminaires, forums et événements d'entreprise à Pointe Denis.",
    en: "A fully customized format for your seminars, forums and corporate events in Pointe Denis.",
  },
  durationDays: 0,
  nights: 0,
  price: 0,
  currency: "XAF",
  badge: { fr: "Sur mesure", en: "Custom" },
  inclusions: [
    { fr: "Logistique complète sur mesure", en: "Fully tailored logistics" },
    { fr: "Espaces de réunion équipés", en: "Equipped meeting spaces" },
    {
      fr: "Restauration & hébergement groupe",
      en: "Catering & group accommodation",
    },
  ],
},
];

export const demoActivities: Activity[] = [
  {
    id: "act-jetski",
    slug: "jet-ski",
    name: { fr: "Jet-ski", en: "Jet-ski" },
    description: {
      fr: "Sensations fortes garanties sur les eaux calmes de l'estuaire, encadrées par nos moniteurs certifiés.",
      en: "Guaranteed thrills on the calm waters of the estuary, supervised by our certified instructors.",
    },
    price: 35000,
    currency: "XAF",
    duration: { fr: "30 minutes", en: "30 minutes" },
    availability: { fr: "Tous les jours, 9h–17h", en: "Every day, 9am–5pm" },
    image: "/jetskie.jpg",
    category: "nautique",
  },
  {
    id: "act-safari",
    slug: "safari-4x4",
    name: { fr: "Safari 4x4", en: "4x4 Safari" },
    description: {
      fr: "Explorez l'arrière-pays de Pointe Denis à bord de véhicules tout-terrain, à la découverte de la faune locale.",
      en: "Explore the Pointe Denis backcountry aboard off-road vehicles, discovering local wildlife.",
    },
    price: 45000,
    currency: "XAF",
    duration: { fr: "2 heures", en: "2 hours" },
    availability: { fr: "Sur réservation", en: "By reservation" },
    image: "/safari.jpg",
    category: "terrestre",
  },
  {
    id: "act-boat",
    slug: "bateau-privatif",
    name: { fr: "Bateau privatif", en: "Private boat" },
    description: {
      fr: "Naviguez en toute intimité le long de la côte, avec équipage et arrêts baignade sur demande.",
      en: "Sail in complete privacy along the coast, with crew and swimming stops on request.",
    },
    price: 150000,
    currency: "XAF",
    duration: { fr: "Demi-journée", en: "Half-day" },
    availability: { fr: "Sur réservation", en: "By reservation" },
    image: "/bateau222.jpg",
    category: "nautique",
  },
  {
    id: "act-shuttle",
    slug: "navette",
    name: { fr: "Navette maritime", en: "Boat shuttle" },
    description: {
      fr: "Traversée confortable entre Libreville et Pointe Denis, plusieurs départs quotidiens.",
      en: "Comfortable crossing between Libreville and Pointe Denis, several daily departures.",
    },
    price: 15000,
    currency: "XAF",
    duration: { fr: "30 minutes", en: "30 minutes" },
    availability: { fr: "Départs quotidiens", en: "Daily departures" },
    image: "/navette.jpg",
    category: "transport",
  },
  {
    id: "act-dining",
    slug: "restauration",
    name: { fr: "Restauration", en: "Dining" },
    description: {
      fr: "Une cuisine gabonaise et internationale préparée avec des produits locaux, face à l'océan.",
      en: "Gabonese and international cuisine prepared with local produce, facing the ocean.",
    },
    price: 20000,
    currency: "XAF",
    duration: { fr: "Selon la formule", en: "Depends on the formula" },
    availability: { fr: "Tous les jours", en: "Every day" },
    image: "/platresto.jpg",
    category: "restauration",
  },
];

export const demoAccommodations: Accommodation[] = [
  {
    id: "acc-lagoon",
    slug: "bungalow-lagon",
    name: { fr: "Bungalow Lagon", en: "Lagoon Bungalow" },
    description: {
      fr: "Un bungalow chaleureux avec vue partielle sur l'océan, idéal pour un séjour en couple.",
      en: "A warm bungalow with partial ocean view, ideal for a couple's stay.",
    },
    price: 45000,
    currency: "XAF",
    capacity: 2,
    amenities: [
      { fr: "Climatisation", en: "Air conditioning" },
      { fr: "Salle de bain privée", en: "Private bathroom" },
      { fr: "Terrasse", en: "Terrace" },
    ],
    availability: { fr: "Disponible", en: "Available" },
    image: "/bungalowLagon.jpg",
  },
  {
    id: "acc-ocean-suite",
    slug: "suite-ocean",
    name: { fr: "Suite Océan", en: "Ocean Suite" },
    description: {
      fr: "Une suite spacieuse avec vue directe sur l'océan et accès privatif à la plage.",
      en: "A spacious suite with direct ocean view and private beach access.",
    },
    price: 95000,
    currency: "XAF",
    capacity: 3,
    amenities: [
      { fr: "Vue mer directe", en: "Direct sea view" },
      { fr: "Accès plage privatif", en: "Private beach access" },
      { fr: "Minibar", en: "Minibar" },
    ],
    availability: { fr: "Disponible", en: "Available" },
    image: "/suitesurmer.jpg",
  },
  {
    id: "acc-villa-vip",
    slug: "villa-vip",
    name: { fr: "Villa VIP", en: "VIP Villa" },
    description: {
      fr: "Notre hébergement le plus exclusif : villa privative, piscine et service de conciergerie dédié.",
      en: "Our most exclusive accommodation: private villa, pool and dedicated concierge service.",
    },
    price: 180000,
    currency: "XAF",
    capacity: 6,
    amenities: [
      { fr: "Piscine privée", en: "Private pool" },
      { fr: "Conciergerie dédiée", en: "Dedicated concierge" },
      { fr: "Cuisine équipée", en: "Equipped kitchen" },
      { fr: "Jusqu'à 6 personnes", en: "Up to 6 guests" },
    ],
    availability: { fr: "Sur demande", en: "On request" },
    image: "/MBOLO.jpg",
  },
];

export const demoTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Aïcha N.",
    role: { fr: "Voyageuse, Libreville", en: "Traveler, Libreville" },
    quote: {
      fr: "Un séjour parfaitement organisé, une équipe aux petits soins et un cadre à couper le souffle. RÈRA a changé ma vision de Pointe Denis.",
      en: "A perfectly organized stay, an attentive team and a breathtaking setting. RÈRA changed my perspective on Pointe Denis.",
    },
    avatar: "/images/voyageur2.jpg",
    rating: 5,
  },
  {
    id: "t2",
    name: "Marc D.",
    role: { fr: "Directeur commercial", en: "Sales Director" },
    quote: {
      fr: "Nous avons organisé notre séminaire annuel avec RÈRA Business : logistique impeccable et cadre inspirant pour nos équipes.",
      en: "We organized our annual seminar with RÈRA Business: flawless logistics and an inspiring setting for our teams.",
    },
    avatar: "/voyageurH.jpg",
    rating: 5,
  },
  {
    id: "t3",
    name: "Sophie L.",
    role: { fr: "Voyageuse, France", en: "Traveler, France" },
    quote: {
      fr: "La navette, l'hébergement, les activités... tout était fluide. On sent une vraie recherche de qualité dans chaque détail.",
      en: "The shuttle, the accommodation, the activities... everything was seamless. You can feel real attention to quality in every detail.",
    },
    avatar: "/images/voyageur2.jpg",
    rating: 5,
  },
];
