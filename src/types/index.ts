export type Locale = "fr" | "en";

export interface LocalizedText {
  fr: string;
  en: string;
}

export interface Package {
  id: string;
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  durationDays: number;
  nights: number;
  price: number;
  currency: string;
  image: string;
  badge?: LocalizedText;
  inclusions: LocalizedText[];
  featured?: boolean;
}

export interface Activity {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  currency: string;
  duration: LocalizedText;
  availability: LocalizedText;
  image: "/savanaBoisson.jpg";
  category: string;
}

export interface Accommodation {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  currency: string;
  capacity: number;
  amenities: LocalizedText[];
  availability: LocalizedText;
  image: "/savanaBoisson.jpg";
}

export interface Testimonial {
  id: string;
  name: string;
  role: LocalizedText;
  quote: LocalizedText;
  avatar: string;
  rating: number;
}

export interface BookingPayload {
  offerType: "package" | "activity" | "accommodation";
  offerSlug: string;
  offerName: string;
  startDate: string;
  endDate?: string;
  adults: number;
  children: number;
  options: string[];
  fullName: string;
  email: string;
  phone: string;
  country: string;
  notes?: string;
  totalEstimate: number;
  currency: string;
}

export interface BusinessRequestPayload {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  eventType: string;
  attendees: number;
  preferredDate?: string;
  budgetRange?: string;
  message: string;
}

export interface ContactPayload {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}
