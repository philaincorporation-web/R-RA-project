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
