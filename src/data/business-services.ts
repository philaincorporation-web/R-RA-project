/**
 * ============================================================
 *  RÈRA Business — Les 6 rubriques de prestations
 *  (source : Catalogue des prestations RÈRA Pointe-Denis)
 * ============================================================
 *  Pour chaque rubrique : texte affiché sur le site, image, et
 *  champs spécifiques du formulaire de demande (étape 2).
 *  Remplacez les images par des photos authentiques de RÈRA dès que possible.
 */

type L = { fr: string; en: string };

export type BusinessFieldType = "text" | "number" | "time" | "date" | "select" | "multi";

export interface BusinessField {
  id: string;
  type: BusinessFieldType;
  label: L;
  options?: L[];
  placeholder?: L;
  required?: boolean;
  /** Occupe toute la largeur de la grille du formulaire. */
  wide?: boolean;
}

export interface BusinessService {
  id: "seminars" | "team-building" | "corporate-events" | "private-hire" | "catering" | "group-accommodation";
  title: L;
  short: L;
  description: L;
  image: string;
  imageAlt: L;
  /** Libellé du champ date commun (étape 1). */
  dateLabel: L;
  fields: BusinessField[];
}

const o = (fr: string, en: string): L => ({ fr, en });

const attendees = (label = o("Nombre de participants", "Number of participants")): BusinessField => ({
  id: "attendees",
  type: "number",
  label,
  required: true,
});

const budget = (label = o("Budget prévisionnel", "Estimated budget")): BusinessField => ({
  id: "budget",
  type: "text",
  label,
  placeholder: o("Ex. 2 000 000 FCFA", "e.g. 2,000,000 XAF"),
});

export const businessServices: BusinessService[] = [
  {
    id: "seminars",
    title: o("Séminaires & forums", "Seminars & forums"),
    short: o("Réunions professionnelles, conférences, ateliers et formations.", "Business meetings, conferences, workshops and training."),
    description: o(
      "Organisez vos séminaires, conférences, ateliers et forums dans un environnement propice aux échanges, à la réflexion et à la prise de décision. RÈRA vous accompagne dans la préparation d'événements professionnels sur mesure à Pointe-Denis.",
      "Host your seminars, conferences, workshops and forums in a setting that encourages dialogue, reflection and decision-making. RÈRA helps you prepare tailor-made professional events in Pointe-Denis."
    ),
    image: "/pointega2.jpg",
    imageAlt: o("Vue aérienne de Pointe-Denis", "Aerial view of Pointe-Denis"),
    dateLabel: o("Date souhaitée", "Preferred date"),
    fields: [
      { id: "role", type: "text", label: o("Fonction du responsable", "Contact's job title") },
      {
        id: "nature",
        type: "select",
        label: o("Nature de l'événement", "Type of event"),
        required: true,
        options: [o("Séminaire", "Seminar"), o("Forum", "Forum"), o("Conférence", "Conference"), o("Atelier", "Workshop"), o("Formation", "Training")],
      },
      attendees(),
      { id: "schedule", type: "text", label: o("Horaires et durée", "Times and duration"), placeholder: o("Ex. 9h–17h, 2 jours", "e.g. 9am–5pm, 2 days") },
      {
        id: "setup",
        type: "select",
        label: o("Configuration de la salle", "Room layout"),
        options: [o("Théâtre", "Theatre"), o("En U", "U-shape"), o("Classe", "Classroom"), o("Tables rondes", "Round tables")],
      },
      {
        id: "equipment",
        type: "multi",
        wide: true,
        label: o("Équipements techniques", "Technical equipment"),
        options: [o("Écran", "Screen"), o("Vidéoprojecteur", "Projector"), o("Sonorisation", "Sound system"), o("Micros", "Microphones"), o("Connexion Internet", "Internet access")],
      },
      {
        id: "catering",
        type: "multi",
        wide: true,
        label: o("Restauration", "Catering"),
        options: [o("Pauses-café", "Coffee breaks"), o("Déjeuner", "Lunch"), o("Dîner", "Dinner"), o("Cocktail", "Cocktail")],
      },
      {
        id: "extras",
        type: "multi",
        wide: true,
        label: o("Besoins complémentaires", "Additional needs"),
        options: [o("Hébergement", "Accommodation"), o("Transport", "Transport")],
      },
    ],
  },
  {
    id: "team-building",
    title: o("Team building", "Team building"),
    short: o("Activités collectives, cohésion et motivation des équipes.", "Group activities, team cohesion and motivation."),
    description: o(
      "Renforcez la cohésion de vos équipes grâce à des expériences collectives dans un cadre naturel exceptionnel. Des activités ludiques aux challenges collaboratifs, créez des moments de partage qui stimulent la motivation et l'esprit d'équipe.",
      "Strengthen team cohesion through shared experiences in an exceptional natural setting. From fun activities to collaborative challenges, create moments that boost motivation and team spirit."
    ),
    image: "/MBOLO.jpg",
    imageAlt: o("Groupe autour de la piscine d'un complexe à Pointe-Denis", "Group around a resort pool in Pointe-Denis"),
    dateLabel: o("Date souhaitée", "Preferred date"),
    fields: [
      attendees(o("Nombre de collaborateurs", "Number of team members")),
      { id: "duration", type: "text", label: o("Durée de l'activité", "Activity duration"), placeholder: o("Ex. demi-journée", "e.g. half a day") },
      {
        id: "goals",
        type: "multi",
        wide: true,
        label: o("Objectif", "Goal"),
        options: [o("Cohésion", "Cohesion"), o("Motivation", "Motivation"), o("Intégration", "Onboarding"), o("Leadership", "Leadership"), o("Détente", "Relaxation")],
      },
      { id: "activities", type: "text", wide: true, label: o("Activités envisagées ou préférées", "Preferred activities"), placeholder: o("Ex. jeux de plage, jet-ski, rallye…", "e.g. beach games, jet ski, treasure hunt…") },
      {
        id: "intensity",
        type: "select",
        label: o("Niveau d'intensité", "Intensity level"),
        options: [o("Doux", "Gentle"), o("Modéré", "Moderate"), o("Sportif", "Sporty")],
      },
      { id: "constraints", type: "text", label: o("Contraintes de participation", "Participation constraints"), placeholder: o("Mobilité réduite, âge…", "Reduced mobility, age…") },
      {
        id: "support",
        type: "multi",
        wide: true,
        label: o("Besoin d'encadrement", "Support needed"),
        options: [o("Animateurs", "Facilitators"), o("Matériel", "Equipment"), o("Encadrement", "Supervision")],
      },
      {
        id: "extras",
        type: "multi",
        wide: true,
        label: o("Services souhaités", "Requested services"),
        options: [o("Restauration", "Catering"), o("Hébergement", "Accommodation"), o("Transport", "Transport")],
      },
      budget(),
    ],
  },
  {
    id: "corporate-events",
    title: o("Événements d'entreprise", "Corporate events"),
    short: o("Galas, cocktails, lancements, anniversaires et cérémonies.", "Galas, cocktails, launches, anniversaries and ceremonies."),
    description: o(
      "Célébrez vos moments importants dans un cadre unique. Lancement de produits, anniversaires d'entreprise, soirées de gala, cocktails professionnels ou cérémonies : RÈRA imagine et organise vos événements selon vos objectifs.",
      "Celebrate your key moments in a unique setting. Product launches, company anniversaries, gala evenings, business cocktails or ceremonies: RÈRA designs and runs your events around your goals."
    ),
    image: "https://images.unsplash.com/photo-1727131581262-fc69925a2e87?q=80&w=1600&auto=format&fit=crop",
    imageAlt: o("Table dressée sur la plage à la Sablière, Libreville", "Table set on the beach at La Sablière, Libreville"),
    dateLabel: o("Date de l'événement", "Event date"),
    fields: [
      {
        id: "eventType",
        type: "select",
        label: o("Type d'événement", "Type of event"),
        required: true,
        options: [o("Gala", "Gala"), o("Cocktail", "Cocktail"), o("Lancement", "Launch"), o("Anniversaire", "Anniversary"), o("Cérémonie", "Ceremony"), o("Soirée", "Party")],
      },
      attendees(o("Nombre d'invités", "Number of guests")),
      { id: "schedule", type: "text", label: o("Horaires et durée", "Times and duration"), placeholder: o("Ex. 19h–minuit", "e.g. 7pm–midnight") },
      {
        id: "ambiance",
        type: "select",
        label: o("Ambiance souhaitée", "Desired atmosphere"),
        options: [o("Chic", "Elegant"), o("Professionnelle", "Professional"), o("Festive", "Festive"), o("Décontractée", "Relaxed")],
      },
      { id: "decor", type: "text", wide: true, label: o("Décoration, scénographie et disposition", "Decoration, staging and layout") },
      {
        id: "technical",
        type: "multi",
        wide: true,
        label: o("Technique et animation", "Technical & entertainment"),
        options: [o("Sonorisation", "Sound system"), o("Éclairage", "Lighting"), o("Animation", "Entertainment"), o("Équipements", "Equipment")],
      },
      { id: "catering", type: "text", wide: true, label: o("Restauration et boissons souhaitées", "Food and drinks") },
      {
        id: "extras",
        type: "multi",
        label: o("Besoins complémentaires", "Additional needs"),
        options: [o("Hébergement", "Accommodation"), o("Transport", "Transport")],
      },
      budget(o("Budget estimatif", "Estimated budget")),
    ],
  },
  {
    id: "private-hire",
    title: o("Privatisation", "Private hire"),
    short: o("Mise à disposition exclusive d'un espace ou d'un établissement.", "Exclusive use of a space or venue."),
    description: o(
      "Profitez d'un espace réservé pour votre événement ou votre séjour. Pour une réception privée, une célébration familiale, une rencontre professionnelle ou une expérience exclusive, RÈRA vous aide à définir une formule adaptée.",
      "Enjoy a dedicated space for your event or stay. For a private reception, a family celebration, a business meeting or an exclusive experience, RÈRA helps you find the right formula."
    ),
    image: "/images/bg-business-3.png",
    imageAlt: o("Terrasse lounge face à l'océan, de nuit", "Ocean-facing lounge terrace at night"),
    dateLabel: o("Date souhaitée", "Preferred date"),
    fields: [
      {
        id: "space",
        type: "select",
        label: o("Espace souhaité", "Space required"),
        required: true,
        options: [o("Restaurant", "Restaurant"), o("Terrasse", "Terrace"), o("Salle", "Room"), o("Espace extérieur", "Outdoor area"), o("Établissement entier", "Entire venue")],
      },
      attendees(o("Nombre de personnes", "Number of people")),
      { id: "startTime", type: "time", label: o("Heure de début", "Start time") },
      { id: "endTime", type: "time", label: o("Heure de fin", "End time") },
      { id: "nature", type: "text", wide: true, label: o("Nature de l'événement ou de l'utilisation", "Nature of the event or use") },
      {
        id: "exclusivity",
        type: "select",
        label: o("Niveau d'exclusivité", "Level of exclusivity"),
        options: [o("Espace réservé (partiel)", "Reserved area (partial)"), o("Exclusivité totale", "Full exclusivity")],
      },
      { id: "equipment", type: "text", label: o("Équipements, mobilier, aménagements", "Equipment, furniture, set-up") },
      {
        id: "extras",
        type: "multi",
        wide: true,
        label: o("Services éventuels", "Optional services"),
        options: [o("Restauration", "Catering"), o("Décoration", "Decoration"), o("Hébergement", "Accommodation")],
      },
      budget(),
    ],
  },
  {
    id: "catering",
    title: o("Restauration sur mesure", "Custom catering"),
    short: o("Buffets, repas, cocktails et menus personnalisés.", "Buffets, meals, cocktails and custom menus."),
    description: o(
      "Offrez à vos invités une expérience culinaire adaptée à leurs envies. Buffet, déjeuner professionnel, dîner, cocktail dînatoire ou menu personnalisé : la prestation de restauration s'adapte au format de votre événement.",
      "Treat your guests to a culinary experience tailored to their tastes. Buffet, business lunch, dinner, cocktail reception or custom menu: our catering adapts to the format of your event."
    ),
    image: "/platresto.jpg",
    imageAlt: o("Table dressée pour un repas", "Table set for a meal"),
    dateLabel: o("Date du service", "Service date"),
    fields: [
      {
        id: "formula",
        type: "select",
        label: o("Type de prestation", "Type of service"),
        required: true,
        options: [o("Buffet", "Buffet"), o("Déjeuner", "Lunch"), o("Dîner", "Dinner"), o("Cocktail", "Cocktail"), o("Menu personnalisé", "Custom menu")],
      },
      attendees(o("Nombre de convives", "Number of guests")),
      { id: "time", type: "time", label: o("Heure du service", "Service time") },
      { id: "location", type: "text", label: o("Lieu du service", "Service location") },
      {
        id: "service",
        type: "select",
        label: o("Service souhaité", "Service style"),
        options: [o("À table", "Table service"), o("Buffet", "Buffet"), o("Cocktail", "Cocktail")],
      },
      { id: "cuisine", type: "text", label: o("Type de cuisine ou menus souhaités", "Cuisine or menus") },
      { id: "diet", type: "text", label: o("Préférences et régimes alimentaires", "Dietary preferences") },
      { id: "allergies", type: "text", label: o("Allergies alimentaires à signaler", "Food allergies") },
      { id: "drinks", type: "text", label: o("Boissons souhaitées", "Drinks") },
      budget(o("Budget par personne ou global", "Budget per person or total")),
    ],
  },
  {
    id: "group-accommodation",
    title: o("Hébergement groupe", "Group accommodation"),
    short: o("Organisation du séjour et répartition des chambres.", "Stay planning and room allocation."),
    description: o(
      "Organisez sereinement le séjour de vos collaborateurs, invités ou groupes. RÈRA vous accompagne dans la définition d'une solution d'hébergement adaptée à l'effectif, à la durée du séjour et au niveau de confort recherché.",
      "Plan your team's, guests' or group's stay with peace of mind. RÈRA helps you find accommodation suited to group size, length of stay and desired comfort level."
    ),
    image: "/bungalowLagon.jpg",
    imageAlt: o("Paillotes en bord de plage", "Beachfront thatched bungalows"),
    dateLabel: o("Date d'arrivée", "Arrival date"),
    fields: [
      { id: "departure", type: "date", label: o("Date de départ", "Departure date"), required: true },
      attendees(o("Nombre total de personnes", "Total number of people")),
      { id: "rooms", type: "number", label: o("Nombre de chambres souhaitées", "Number of rooms") },
      {
        id: "distribution",
        type: "multi",
        wide: true,
        label: o("Répartition des chambres", "Room allocation"),
        options: [o("Individuelles", "Single"), o("Doubles", "Double"), o("Multiples", "Shared")],
      },
      {
        id: "comfort",
        type: "select",
        label: o("Niveau de confort", "Comfort level"),
        options: [o("Standard", "Standard"), o("Confort", "Comfort"), o("Premium / VIP", "Premium / VIP")],
      },
      {
        id: "meals",
        type: "select",
        label: o("Restauration pendant le séjour", "Meals during the stay"),
        options: [o("Petit-déjeuner", "Breakfast"), o("Demi-pension", "Half board"), o("Pension complète", "Full board"), o("Aucune", "None")],
      },
      {
        id: "transport",
        type: "select",
        label: o("Transport vers Pointe-Denis", "Transport to Pointe-Denis"),
        options: [o("Navette à organiser par RÈRA", "Shuttle arranged by RÈRA"), o("Transport par nos soins", "We'll arrange our own")],
      },
      { id: "needs", type: "text", label: o("Besoins particuliers des participants", "Special needs of participants") },
      budget(o("Budget par chambre ou global", "Budget per room or total")),
    ],
  },
];
