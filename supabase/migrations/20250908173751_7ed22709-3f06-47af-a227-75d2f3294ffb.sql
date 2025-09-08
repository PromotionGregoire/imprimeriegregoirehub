-- 1) Supprimer l'ancien CHECK constraint qui bloque 'create_proof'
ALTER TABLE ordre_historique
  DROP CONSTRAINT IF EXISTS check_action_type;

-- 2) Recréer un CHECK souple et insensible à la casse
--    -> ajoute 'create_proof' et les actions déjà vues dans le projet
ALTER TABLE ordre_historique
  ADD CONSTRAINT check_action_type
  CHECK (
    LOWER(action_type) IN (
      'create_order',
      'create_proof',
      'upload_proof',
      'send_proof',             -- équivalent EN
      'send_epreuve',           -- équivalent FR
      'proof_approved',
      'approve_epreuve',
      'proof_rejected',
      'reject_epreuve',
      'proof_modification_requested',
      'add_comment',
      'status_change',
      'update_order',
      'start_production',
      'submission_approved'
    )
  ) NOT VALID;

-- 3) Fonction pour mettre automatiquement la commande à "Épreuve acceptée" quand un BAT est approuvé
CREATE OR REPLACE FUNCTION set_order_status_on_proof_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF LOWER(NEW.status) IN ('approved', 'approuvée', 'approuvee', 'valide', 'validé', 'validée')
     AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE orders
      SET status = 'Épreuve acceptée',
          updated_at = now()
      WHERE id = NEW.order_id;

    -- Journaliser l'événement
    PERFORM add_ordre_history(
      p_action_description := 'Épreuve approuvée par le client (v' || NEW.version || ')',
      p_action_type        := 'proof_approved',
      p_order_id           := NEW.order_id,
      p_proof_id           := NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Créer le trigger pour l'auto-avancement des commandes
DROP TRIGGER IF EXISTS trg_set_order_status_on_proof_approval ON proofs;
CREATE TRIGGER trg_set_order_status_on_proof_approval
AFTER UPDATE OF status ON proofs
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION set_order_status_on_proof_approval();