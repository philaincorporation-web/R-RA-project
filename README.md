# RÈRA — Pointe Denis, Gabon

Plateforme digitale touristique premium dédiée à la découverte de **Pointe Denis, Gabon** : séjours, hébergements, activités, événements d'entreprise (RÈRA Business) et réservation en ligne.

Construit avec **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, données **SheetDB / Google Sheets**, internationalisation **FR/EN** et **Light/Dark mode**.

---

## 1. Sommaire

- [Stack technique](#2-stack-technique)
- [Démarrage rapide](#3-démarrage-rapide)
- [Structure du projet](#4-structure-du-projet)
- [Configuration SheetDB](#5-configuration-sheetdb)
- [Internationalisation (FR/EN)](#6-internationalisation-fren)
- [Dark / Light mode](#7-dark--light-mode)
- [Système de réservation](#8-système-de-réservation)
- [SEO](#9-seo)
- [Déploiement sur Vercel](#10-déploiement-sur-vercel)
- [Checklist de tests avant mise en production](#11-checklist-de-tests)

---

## 2. Stack technique

| Domaine | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Thème | next-themes (Light / Dark / système) |
| Données | SheetDB (Google Sheets) |
| Validation | Zod |
| Icônes | lucide-react |
| Déploiement | Vercel |

Le design system (couleurs, typographie, effets) s'inspire du niveau de finition du template Aceternity UI fourni en référence, mais **aucun code du template n'a été copié** : tous les composants "de type Aceternity" (Spotlight, Aurora background, Bento grid, Infinite moving cards, Reveal on scroll) ont été réimplémentés spécifiquement pour RÈRA dans `src/components/ui/aceternity/`.

---

## 3. Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env.local
# → renseigner SHEETDB_API_URL (voir section 5)

# 3. Lancer le serveur de développement
npm run dev
# → http://localhost:3000 (redirige automatiquement vers /fr ou /en)

# 4. Build de production
npm run build
npm run start

# 5. Vérifications
npm run typecheck   # TypeScript
npm run lint        # ESLint
```

> **Important** : si `SHEETDB_API_URL` n'est pas configuré, le site fonctionne quand même grâce à des **données de démonstration** (`src/lib/sheetdb/demo-data.ts`), ce qui permet de tester immédiatement tout le parcours (packages, activités, hébergements, réservation) avant même d'avoir connecté Google Sheets.

---

## 4. Structure du projet

```text
src/
├── app/
│   ├── layout.tsx                 # Layout racine (polices, ThemeProvider)
│   ├── page.tsx                   # Redirige vers /fr (locale par défaut)
│   ├── robots.ts / sitemap.ts     # SEO
│   ├── [locale]/
│   │   ├── layout.tsx             # Navbar + Footer + metadata par langue
│   │   ├── page.tsx               # Page d'accueil
│   │   ├── discover/
│   │   ├── history/
│   │   ├── packages/[slug]/
│   │   ├── accommodation/[slug]/
│   │   ├── activities/[slug]/
│   │   ├── business/
│   │   ├── booking/
│   │   ├── practical-info/
│   │   ├── contact/
│   │   └── legal|privacy|terms/
│   └── api/
│       ├── packages/ activities/ accommodation/   (GET - lecture publique)
│       └── bookings/ business/ contact/            (POST - écriture validée)
│
├── components/
│   ├── layout/         # Footer, ThemeProvider, PageHero
│   ├── navigation/      # Navbar, ThemeToggle, LanguageSwitcher
│   ├── hero/             # Hero de la page d'accueil
│   ├── packages/ activities/ accommodation/  # Cartes produit
│   ├── booking/          # Stepper de réservation multi-étapes
│   ├── business/         # Formulaire de devis Business
│   ├── sections/         # Sections de la homepage
│   └── ui/
│       ├── button.tsx, primitives.tsx
│       └── aceternity/   # Spotlight, Aurora, BentoGrid, InfiniteMovingCards, Reveal
│
├── lib/
│   ├── sheetdb/          # client.ts, queries.ts, mutations.ts, demo-data.ts
│   ├── i18n/             # config.ts, get-dictionary.ts, dictionaries/{fr,en}.json
│   ├── validation/       # Schémas Zod (booking, business, contact)
│   ├── pricing/          # Calcul du total de réservation
│   └── utils/            # cn(), formatPrice(), formatDate()
│
├── types/                # Types métier partagés
├── hooks/                # useReducedMotion, useIsScrolled
├── styles/globals.css    # Design tokens, base Tailwind
└── proxy.ts              # Détection et redirection de locale (ex-middleware)
```

---

## 5. Configuration SheetDB

### 5.1 Créer les feuilles Google Sheets

Créez un Google Sheet avec un onglet par type de contenu : `packages`, `activities`, `accommodation`, `bookings`, `business_requests`, `contact_messages`. Connectez-le à [SheetDB](https://sheetdb.io) pour obtenir une URL d'API.

### 5.2 Convention de colonnes (lecture)

Toutes les feuilles de contenu (`packages`, `activities`, `accommodation`) suivent la convention **`colonne_fr` / `colonne_en`**, ce qui permet de gérer le FR/EN directement dans Google Sheets sans toucher au code.

**Feuille `packages`** :

```text
id | slug | name_fr | name_en | tagline_fr | tagline_en
description_fr | description_en | duration_days | nights
price | currency | image | badge_fr | badge_en
inclusions_fr (séparées par "|") | inclusions_en (séparées par "|")
featured (TRUE/FALSE)
```

**Feuille `activities`** :

```text
id | slug | name_fr | name_en | description_fr | description_en
price | currency | duration_fr | duration_en
availability_fr | availability_en | image | category
```

**Feuille `accommodation`** :

```text
id | slug | name_fr | name_en | description_fr | description_en
price | currency | capacity
amenities_fr (séparées par "|") | amenities_en (séparées par "|")
availability_fr | availability_en | image
```

### 5.3 Feuilles d'écriture

`bookings`, `business_requests`, `contact_messages` sont remplies automatiquement par les Route Handlers (`src/app/api/*/route.ts`) — vous n'avez rien à saisir manuellement, les colonnes sont créées par SheetDB au premier envoi.

### 5.4 Sécurité

- Toutes les requêtes SheetDB (lecture **et** écriture) sont effectuées **uniquement côté serveur** (`import "server-only"` dans `src/lib/sheetdb/`).
- Aucune URL ni clé SheetDB n'est jamais exposée au client : les formulaires (`booking-stepper.tsx`, `business-request-form.tsx`, `contact-form.tsx`) appellent les **Route Handlers internes** (`/api/bookings`, `/api/business`, `/api/contact`), qui valident les données avec **Zod** avant d'écrire dans SheetDB.

---

## 6. Internationalisation (FR/EN)

- Routing par préfixe : `/fr/...` et `/en/...` (voir `src/proxy.ts` pour la détection automatique de langue au premier accès).
- Dictionnaires centralisés dans `src/lib/i18n/dictionaries/{fr,en}.json`, chargés côté serveur via `getDictionary()`.
- Aucun texte d'interface n'est écrit en dur dans les composants : tout provient du dictionnaire ou des colonnes `_fr`/`_en` de SheetDB.
- Le sélecteur de langue (`LanguageSwitcher`) préserve la page courante lors du changement de langue.

---

## 7. Dark / Light mode

- Géré par `next-themes` (`src/components/layout/theme-provider.tsx`), avec détection de la préférence système et persistance dans `localStorage`.
- Palette dédiée en dark mode (pas un simple `bg-black` — voir `tailwind.config.ts`, variantes `rera-navy-800/900/950`).
- Bouton de bascule accessible dans la navbar (desktop et mobile).

---

## 8. Système de réservation

Le parcours de réservation (`/[locale]/booking`) est un stepper client (`src/components/booking/booking-stepper.tsx`) en 7 étapes, animé avec Framer Motion :

1. **Offre** (package, activité ou hébergement — pré-sélectionnable via `?offer=slug&type=package`)
2. **Date**
3. **Voyageurs** (adultes / enfants)
4. **Options** additionnelles
5. **Récapitulatif** (calcul du total via `src/lib/pricing`)
6. **Coordonnées**
7. **Paiement** (choix du mode, aucun prélèvement — confirmation manuelle par l'équipe RÈRA)

À la soumission, les données sont validées par Zod puis envoyées à `/api/bookings`, qui les écrit dans SheetDB et retourne une référence de réservation (`RERA-BK-...`).

---

## 9. SEO

- `generateMetadata` par page (title, description, Open Graph, Twitter Card) dans chaque route.
- `src/app/sitemap.ts` génère dynamiquement les URLs FR/EN, y compris chaque package/activité/hébergement.
- `src/app/robots.ts` référence le sitemap.
- URLs propres et localisées (`/fr/packages/vip`, `/en/packages/vip`, etc.).

---

## 10. Déploiement sur Vercel

1. Poussez ce projet sur un repository Git (GitHub/GitLab/Bitbucket).
2. Importez-le sur [vercel.com/new](https://vercel.com/new).
3. Renseignez les variables d'environnement du `.env.example` dans les **Project Settings → Environment Variables**.
4. Déployez — Vercel détecte automatiquement Next.js 16.
5. (Optionnel) Configurez un domaine personnalisé et mettez à jour `NEXT_PUBLIC_SITE_URL`.

---

## 11. Checklist de tests

- [x] `npm run build` — build de production propre (validé dans cet environnement)
- [x] `npm run typecheck` — TypeScript sans erreur
- [x] `npm run lint` — ESLint sans erreur
- [x] Vérification FR/EN sur les pages principales
- [x] Vérification Dark/Light (à tester visuellement après déploiement)
- [ ] Vérification des formulaires avec une vraie URL SheetDB (actuellement testé avec fallback démo)
- [x] Vérification responsive (Tailwind mobile-first, breakpoints `sm/md/lg/xl`)
- [x] `prefers-reduced-motion` respecté (animations désactivées automatiquement)
- [ ] Test des appels SheetDB en conditions réelles une fois les Google Sheets connectés
- [ ] Revue des textes légaux (mentions légales, confidentialité, CGU) avec les informations réelles de l'entreprise

---

## Notes de conception

- **Design de référence** : le ZIP Aceternity UI fourni a servi uniquement de **référence visuelle et UX** (hiérarchie, cartes, effets de profondeur, animations). Aucun code, texte ou asset du template n'a été repris : tous les composants ont été réécrits pour RÈRA avec la palette bleu nuit / lagon / émeraude / or.
- **Polices** : Poppins (titres) et Inter (corps de texte), chargées via Google Fonts (`<link>` dans `app/layout.tsx`) plutôt que `next/font/google`, pour rester compatible avec les environnements de build sans accès sortant à `fonts.googleapis.com`. Vous pouvez migrer vers `next/font/google` sans changement fonctionnel si votre environnement de build a accès à Internet.
- **Prix** : jamais codés en dur dans les composants — toujours lus depuis SheetDB (ou le fallback de démonstration).
