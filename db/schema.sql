-- ============================================================
--  RÈRA — Schéma Postgres (Neon)
--  Appliqué par : npm run db:migrate   (idempotent, peut être relancé)
--  Les comptes utilisateurs eux-mêmes sont gérés par Neon Auth
--  (schéma "neon_auth") : ne pas les recréer ici.
-- ============================================================

-- Historique des réservations et demandes Business.
-- Google Sheets reste la source de travail de l'équipe ; cette table
-- sert à l'espace client (historique, récapitulatif, réclamations).
CREATE TABLE IF NOT EXISTS reservations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference         text NOT NULL UNIQUE,
  kind              text NOT NULL CHECK (kind IN ('booking', 'business')),
  -- Identifiant Neon Auth du propriétaire (NULL tant que la réservation n'est pas rattachée à un compte).
  user_id           text,
  full_name         text NOT NULL,
  email             text NOT NULL,
  phone             text,
  country           text,
  title             text NOT NULL,          -- nom de l'offre ou de la rubrique Business
  start_date        date,
  end_date          date,
  total_estimate    numeric(14, 2),
  currency          text,
  status            text NOT NULL DEFAULT 'pending',
  -- Récapitulatif complet de la demande (voyageurs, options, paiement, champs Business…).
  summary           jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Empreinte SHA-256 du jeton permettant de rattacher une réservation faite sans compte.
  claim_token_hash  text,
  claimed_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reservations_user_id_idx ON reservations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reservations_email_idx ON reservations (lower(email));

-- Informations complémentaires du client (non stockées par Neon Auth).
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id     text PRIMARY KEY,
  phone       text,
  country     text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
--  BACK-OFFICE : rôles, membres de l'équipe, journal d'activité
-- ============================================================

-- Rôle = ensemble de permissions (voir src/lib/admin/permissions.ts).
-- Le rôle "super-admin" a toujours tous les droits et ne peut être ni modifié ni supprimé.
CREATE TABLE IF NOT EXISTS admin_roles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  name         text NOT NULL,
  description  text,
  permissions  text[] NOT NULL DEFAULT '{}',
  is_system    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Membre de l'équipe = compte Neon Auth (neon_auth.user.id) + un rôle.
CREATE TABLE IF NOT EXISTS admin_members (
  user_id     text PRIMARY KEY,
  role_id     uuid NOT NULL REFERENCES admin_roles (id) ON DELETE RESTRICT,
  added_by    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_members_role_idx ON admin_members (role_id);

-- Journal de toutes les modifications faites dans le back-office.
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id           bigserial PRIMARY KEY,
  actor_id     text,
  actor_email  text,
  action       text NOT NULL,
  target_type  text,
  target_id    text,
  details      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON admin_audit_log (created_at DESC);

-- Rôles de départ (créés une seule fois, modifiables ensuite depuis le back-office).
INSERT INTO admin_roles (slug, name, description, permissions, is_system) VALUES
  ('super-admin', 'Super admin', 'Tous les droits, y compris la gestion de l''équipe et des rôles.', ARRAY[]::text[], true),
  ('reservations-manager', 'Gestionnaire réservations', 'Traite les réservations, les demandes Business et les messages.',
    ARRAY['reservations.view','reservations.manage','business.view','business.manage','messages.view','messages.manage','clients.view'], false),
  ('content-editor', 'Éditeur de contenu', 'Met à jour le catalogue et les contenus du site.',
    ARRAY['catalog.view','catalog.edit','content.edit'], false),
  ('read-only', 'Lecture seule', 'Consulte toutes les données sans pouvoir les modifier.',
    ARRAY['reservations.view','business.view','messages.view','catalog.view','clients.view'], false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
--  DEMANDES CLIENTS : Neon devient la seule base (plus de Google Sheets)
-- ============================================================

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS internal_notes text;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at timestamptz;
-- 'site' = formulaire du site, 'sheets' = importée depuis Google Sheets.
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'site';

UPDATE reservations SET status = 'new' WHERE kind = 'business' AND status = 'pending';

-- 'pending' reste toléré sur 'business' : une ancienne version du site peut encore l'écrire.
-- Il est affiché et filtré comme 'new'.
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check CHECK (
  (kind = 'booking' AND status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled', 'refused'))
  OR (kind = 'business' AND status IN ('pending', 'new', 'in_progress', 'quote_sent', 'accepted', 'refused'))
);

CREATE INDEX IF NOT EXISTS reservations_kind_created_idx ON reservations (kind, created_at DESC);

CREATE TABLE IF NOT EXISTS contact_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       text NOT NULL UNIQUE,
  full_name       text NOT NULL,
  email           text NOT NULL,
  subject         text NOT NULL,
  message         text NOT NULL,
  status          text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'handled', 'archived')),
  internal_notes  text,
  source          text NOT NULL DEFAULT 'site',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC);

-- ============================================================
--  DISPONIBILITÉS (moteur de réservation)
--  Règle des dates : un séjour [arrivée, départ) occupe les nuits
--  de l'arrivée à la veille du départ. Le jour du départ est libre.
-- ============================================================

-- Règles de stock par offre. Sans ligne ici, l'offre est « sur demande » :
-- aucune disponibilité n'est calculée ni annoncée.
--   nightly    = hébergement, stock d'unités par nuit (units_total logements)
--   daily      = activité, nombre de places par jour (units_total places)
--   on_request = pas de stock géré, l'équipe vérifie à la main
CREATE TABLE IF NOT EXISTS offer_inventory (
  offer_slug       text PRIMARY KEY,
  offer_type       text NOT NULL CHECK (offer_type IN ('accommodation', 'activity', 'package')),
  mode             text NOT NULL DEFAULT 'on_request' CHECK (mode IN ('nightly', 'daily', 'on_request')),
  units_total      integer CHECK (units_total IS NULL OR units_total >= 0),
  guests_per_unit  integer CHECK (guests_per_unit IS NULL OR guests_per_unit > 0),
  min_nights       integer NOT NULL DEFAULT 1 CHECK (min_nights >= 1),
  updated_by       text,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Fermetures et blocages manuels. units NULL = offre entièrement fermée sur la période.
CREATE TABLE IF NOT EXISTS availability_blocks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_slug  text NOT NULL,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  units       integer CHECK (units IS NULL OR units > 0),
  reason      text,
  created_by  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS availability_blocks_offer_idx ON availability_blocks (offer_slug, start_date);

-- Offre réservée, unités consommées (logements ou places) et fin du blocage temporaire.
-- Les anciennes demandes n'ont pas offer_slug : on lit alors summary->>'offerSlug'.
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS offer_slug text;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS units integer NOT NULL DEFAULT 1;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS hold_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS reservations_offer_dates_idx
  ON reservations ((COALESCE(offer_slug, summary->>'offerSlug')), start_date)
  WHERE kind = 'booking';

-- Occupation d'une offre pour une nuit (ou un jour d'activité) :
--   firm    = unités des réservations confirmées, payées ou terminées
--   held    = unités des demandes en attente encore bloquées (48 h par défaut)
--   blocked = unités bloquées à la main
--   closed  = offre entièrement fermée ce jour-là
-- p_exclude : référence à ignorer (la demande que l'on est en train de confirmer).
CREATE OR REPLACE FUNCTION rera_capacity_used(p_slug text, p_night date, p_exclude text)
RETURNS TABLE (firm integer, held integer, blocked integer, closed boolean)
LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE((SELECT sum(r.units) FROM reservations r
               WHERE r.kind = 'booking'
                 AND COALESCE(r.offer_slug, r.summary->>'offerSlug') = p_slug
                 AND r.status IN ('confirmed', 'paid', 'completed')
                 AND r.start_date <= p_night
                 AND COALESCE(r.end_date, r.start_date + 1) > p_night
                 AND r.reference IS DISTINCT FROM p_exclude), 0)::integer,
    COALESCE((SELECT sum(r.units) FROM reservations r
               WHERE r.kind = 'booking'
                 AND COALESCE(r.offer_slug, r.summary->>'offerSlug') = p_slug
                 AND r.status = 'pending'
                 AND COALESCE(r.hold_expires_at, r.created_at + interval '48 hours') > now()
                 AND r.start_date <= p_night
                 AND COALESCE(r.end_date, r.start_date + 1) > p_night
                 AND r.reference IS DISTINCT FROM p_exclude), 0)::integer,
    COALESCE((SELECT sum(b.units) FROM availability_blocks b
               WHERE b.offer_slug = p_slug AND b.units IS NOT NULL
                 AND b.start_date <= p_night AND b.end_date > p_night), 0)::integer,
    EXISTS (SELECT 1 FROM availability_blocks b
             WHERE b.offer_slug = p_slug AND b.units IS NULL
               AND b.start_date <= p_night AND b.end_date > p_night)
$$
;

-- ============================================================
--  SUIVI DE DEMANDE SANS COMPTE (référence + code envoyé par e-mail)
--  Une ligne par demande de code, même quand la référence ne correspond
--  pas (code_hash NULL) : sert aussi à limiter les abus par adresse IP.
--  Le code n'est jamais stocké en clair (HMAC). Lignes purgées après 1 jour.
-- ============================================================
CREATE TABLE IF NOT EXISTS tracking_codes (
  id          bigserial PRIMARY KEY,
  reference   text NOT NULL,
  code_hash   text,
  ip_hash     text,
  attempts    integer NOT NULL DEFAULT 0,
  expires_at  timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tracking_codes_reference_idx ON tracking_codes (reference, created_at DESC);
CREATE INDEX IF NOT EXISTS tracking_codes_ip_idx ON tracking_codes (ip_hash, created_at DESC)
