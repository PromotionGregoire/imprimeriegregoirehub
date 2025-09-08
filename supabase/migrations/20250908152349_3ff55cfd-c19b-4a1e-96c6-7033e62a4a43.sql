-- ===================================================
-- PATCH FINAL - Remplacer contrainte existante
-- ===================================================

-- 1) Corriger after_payment_update_invoice() pour gérer DELETE & changement invoice_id
CREATE OR REPLACE FUNCTION after_payment_update_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old uuid := NULL;
  v_new uuid := NULL;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new := NEW.invoice_id;
    UPDATE invoices SET updated_at = now() WHERE id = v_new;

  ELSIF TG_OP = 'UPDATE' THEN
    v_old := OLD.invoice_id;
    v_new := NEW.invoice_id;
    IF v_old IS DISTINCT FROM v_new THEN
      UPDATE invoices SET updated_at = now() WHERE id IN (v_old, v_new);
    ELSE
      UPDATE invoices SET updated_at = now() WHERE id = v_new;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    v_old := OLD.invoice_id;
    UPDATE invoices SET updated_at = now() WHERE id = v_old;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2) Nettoyer TOUTES les anciennes valeurs de statut
UPDATE submissions SET status = 'Approuvée' WHERE status = 'Acceptée';
UPDATE submissions SET status = 'En attente d''approbation' WHERE status = 'Envoyée';
UPDATE submissions SET status = 'Brouillon' WHERE status ILIKE 'draft';
UPDATE submissions SET status = 'En attente d''approbation' WHERE status ILIKE 'pending';
UPDATE submissions SET status = 'Approuvée' WHERE status ILIKE 'approved';
UPDATE submissions SET status = 'Rejetée' WHERE status ILIKE 'rejected';
UPDATE submissions SET status = 'Modification demandée' WHERE status ILIKE 'modification_requested';

-- 3) Supprimer l'ancienne contrainte et en créer une nouvelle
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_status;

-- 4) Ajouter la nouvelle contrainte avec les bonnes valeurs
ALTER TABLE submissions
  ADD CONSTRAINT chk_submissions_status
  CHECK (status IN (
    'Brouillon',
    'En attente d''approbation',
    'Approuvée', 
    'Rejetée',
    'Modification demandée'
  ));