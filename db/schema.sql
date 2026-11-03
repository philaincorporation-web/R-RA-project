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
  (kind = 'booking' AND status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled'))
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
