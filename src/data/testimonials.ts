/**
 * ============================================================
 *  RÈRA — Témoignages clients (modifiables ici)
 * ============================================================
 *  Ajoutez / modifiez / supprimez des avis librement.
 */

import type { Testimonial } from "@/types";

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Marie K.",
    role: { fr: "Voyageuse", en: "Traveler" },
    quote: {
      fr: "Une expérience inoubliable. L'équipe RÈRA a tout organisé à la perfection, de la navette au coucher de soleil sur la plage.",
      en: "An unforgettable experience. The RÈRA team organized everything perfectly, from the shuttle to the sunset on the beach.",
    },
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    rating: 5,
  },
  {
    id: "t2",
    name: "Jean-Paul M.",
    role: { fr: "Directeur RH", en: "HR Director" },
    quote: {
      fr: "Nous avons organisé notre séminaire d'entreprise avec RÈRA Business. Cadre magnifique, service impeccable. Je recommande vivement.",
      en: "We organized our company seminar with RÈRA Business. Beautiful setting, impeccable service. Highly recommended.",
    },
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    rating: 5,
  },
  {
    id: "t3",
    name: "Sophie L.",
    role: { fr: "Couple en séjour", en: "Couple on stay" },
    quote: {
      fr: "Le package Junior était parfait pour un week-end en amoureux. Hébergement confortable et activités très bien choisies.",
      en: "The Junior package was perfect for a romantic weekend. Comfortable accommodation and well-chosen activities.",
    },
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    rating: 5,
  },
];
