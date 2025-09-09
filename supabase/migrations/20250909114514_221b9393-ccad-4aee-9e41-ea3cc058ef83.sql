-- =========================================================
-- ARCHIVE PACK (submissions / orders / proofs)
-- Soft-archive: archived_at, archived_by, archive_reason
-- Sans impact sur les flux existants (exclusion par défaut via vues)
-- =========================================================

-- 1) Colonnes d'archivage (nullable)
ALTER TABLE IF EXISTS submissions
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS archive_reason text;

ALTER TABLE IF NOT EXISTS orders
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS archive_reason text;

ALTER TABLE IF NOT EXISTS proofs
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS archive_reason text;

-- 2) Index utiles (listes rapides, filtres fréquents)
CREATE INDEX IF NOT EXISTS idx_submissions_archived_at ON submissions(archived_at);
CREATE INDEX IF NOT EXISTS idx_orders_archived_at      ON orders(archived_at);
CREATE INDEX IF NOT EXISTS idx_proofs_archived_at      ON proofs(archived_at);

-- 3) VUES "actives" (excluent archivées) pour usages par défaut
CREATE OR REPLACE VIEW v_active_submissions AS
  SELECT * FROM submissions WHERE archived_at IS NULL;

CREATE OR REPLACE VIEW v_active_orders AS
  SELECT * FROM orders WHERE archived_at IS NULL;

CREATE OR REPLACE VIEW v_active_proofs AS
  SELECT * FROM proofs WHERE archived_at IS NULL;

-- (Option) VUES "archived" si besoin d'onglets dédiés
CREATE OR REPLACE VIEW v_archived_submissions AS
  SELECT * FROM submissions WHERE archived_at IS NOT NULL;

CREATE OR REPLACE VIEW v_archived_orders AS
  SELECT * FROM orders WHERE archived_at IS NOT NULL;

CREATE OR REPLACE VIEW v_archived_proofs AS
  SELECT * FROM proofs WHERE archived_at IS NOT NULL;

-- 4) Fonctions utilitaires: archiver / désarchiver (idempotentes)

CREATE OR REPLACE FUNCTION archive_submission(p_submission_id uuid, p_reason text, p_by uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE submissions
     SET archived_at   = COALESCE(archived_at, now()),
         archived_by   = COALESCE(archived_by, p_by),
         archive_reason= COALESCE(archive_reason, p_reason),
         updated_at    = now()
   WHERE id = p_submission_id;
END$$;

CREATE OR REPLACE FUNCTION unarchive_submission(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE submissions
     SET archived_at   = NULL,
         archived_by   = NULL,
         archive_reason= NULL,
         updated_at    = now()
   WHERE id = p_submission_id;
END$$;

-- Archiver une commande, et par cohérence archiver aussi ses proof(s)
CREATE OR REPLACE FUNCTION archive_order(p_order_id uuid, p_reason text, p_by uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
     SET archived_at   = COALESCE(archived_at, now()),
         archived_by   = COALESCE(archived_by, p_by),
         archive_reason= COALESCE(archive_reason, p_reason),
         updated_at    = now()
   WHERE id = p_order_id;

  UPDATE proofs
     SET archived_at   = COALESCE(archived_at, now()),
         archived_by   = COALESCE(archived_by, p_by),
         archive_reason= COALESCE(archive_reason, p_reason),
         updated_at    = now()
   WHERE order_id = p_order_id;
END$$;

CREATE OR REPLACE FUNCTION unarchive_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
     SET archived_at   = NULL,
         archived_by   = NULL,
         archive_reason= NULL,
         updated_at    = now()
   WHERE id = p_order_id;

  UPDATE proofs
     SET archived_at   = NULL,
         archived_by   = NULL,
         archive_reason= NULL,
         updated_at    = now()
   WHERE order_id = p_order_id;
END$$;

CREATE OR REPLACE FUNCTION archive_proof(p_proof_id uuid, p_reason text, p_by uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proofs
     SET archived_at   = COALESCE(archived_at, now()),
         archived_by   = COALESCE(archived_by, p_by),
         archive_reason= COALESCE(archive_reason, p_reason),
         updated_at    = now()
   WHERE id = p_proof_id;
END$$;

CREATE OR REPLACE FUNCTION unarchive_proof(p_proof_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proofs
     SET archived_at   = NULL,
         archived_by   = NULL,
         archive_reason= NULL,
         updated_at    = now()
   WHERE id = p_proof_id;
END$$;

-- 5) Triggers existants: ignorer les lignes archivées (no‑op)
-- Exemple: notification épreuve -> ne rien faire si NEW.archived_at IS NOT NULL
CREATE OR REPLACE FUNCTION send_proof_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.archived_at IS NOT NULL THEN
    RETURN NEW; -- épreuve archivée : pas d'envoi, pas de log
  END IF;

  IF NEW.status = 'Envoyée au client' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Generate approval token if not exists
    IF NEW.approval_token IS NULL OR NEW.approval_token = '' THEN
        NEW.approval_token := gen_random_uuid()::text;
    END IF;
    
    -- Log the email notification in the database
    INSERT INTO public.email_notifications (proof_id, email_type, recipient_email, success)
    SELECT NEW.id, 'proof_notification', c.email, true
    FROM public.orders o
    JOIN public.submissions s ON o.submission_id = s.id
    JOIN public.clients c ON s.client_id = c.id
    WHERE o.id = NEW.order_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 6) Metrics (optionnel) : exclure archives
CREATE OR REPLACE VIEW dashboard_metrics_view AS
SELECT
  (SELECT COUNT(*) FROM submissions WHERE archived_at IS NULL AND status = 'En attente d''approbation') AS pending_submissions,
  (SELECT COUNT(*) FROM proofs      WHERE archived_at IS NULL AND status IN ('En préparation','Envoyée au client','En révision')) AS pending_proofs,
  (SELECT COUNT(*) FROM orders      WHERE archived_at IS NULL AND status NOT IN ('Complétée', 'Annulée')) AS active_orders;