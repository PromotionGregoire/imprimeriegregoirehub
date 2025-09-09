-- ===============================
-- DELTA TECHNIQUE - SYSTÈME COHÉRENT DE BOUT EN BOUT
-- ===============================

-- 1) AJOUTER COLONNES D'ARCHIVAGE
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID,
ADD COLUMN IF NOT EXISTS archive_reason TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID,
ADD COLUMN IF NOT EXISTS archive_reason TEXT;

ALTER TABLE proofs 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID,
ADD COLUMN IF NOT EXISTS archive_reason TEXT,
ADD COLUMN IF NOT EXISTS proof_code TEXT;

-- 2) TRIGGER POUR PROOF_CODE (numérotation unifiée)
CREATE OR REPLACE FUNCTION set_proof_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
  v_base text;
BEGIN
  IF NEW.proof_code IS NULL OR NEW.proof_code = '' THEN
    SELECT order_number INTO v_order_number FROM orders WHERE id = NEW.order_id;
    IF v_order_number IS NOT NULL THEN
      -- remplace le préfixe lettre par 'E-'
      v_base := 'E-' || regexp_replace(v_order_number, '^[A-Z]-', '');
      IF NEW.version IS NOT NULL THEN
        NEW.proof_code := v_base || '-v' || lpad(NEW.version::text, 2, '0');
      ELSE
        NEW.proof_code := v_base || '-v01';
        NEW.version := COALESCE(NEW.version, 1);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_proof_code ON proofs;
CREATE TRIGGER trg_set_proof_code
BEFORE INSERT OR UPDATE ON proofs
FOR EACH ROW
EXECUTE FUNCTION set_proof_code();

-- 3) TRIGGER POUR SYNCHRONISER ORDRE STATUT DEPUIS ÉPREUVE  
CREATE OR REPLACE FUNCTION sync_order_status_from_proof()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si l'épreuve passe à "Approuvée", mettre la commande à "Épreuve acceptée"
  IF NEW.status = 'Approuvée' AND (OLD.status IS NULL OR OLD.status != 'Approuvée') THEN
    UPDATE orders
    SET status = 'Épreuve acceptée',
        updated_at = now()
    WHERE id = NEW.order_id;

    -- Log dans l'historique
    PERFORM add_ordre_history(
      p_order_id => NEW.order_id,
      p_action_type => 'proof_approved',
      p_action_description => 'Épreuve v' || COALESCE(NEW.version, 1) || ' approuvée - Commande prête pour production',
      p_client_action => TRUE,
      p_proof_id => NEW.id
    );
  END IF;

  -- Si l'épreuve passe à "Modification demandée", remettre la commande en attente
  IF NEW.status = 'Modification demandée' AND (OLD.status IS NULL OR OLD.status != 'Modification demandée') THEN
    UPDATE orders
    SET status = 'En attente de l''épreuve',
        updated_at = now()
    WHERE id = NEW.order_id;

    -- Log dans l'historique
    PERFORM add_ordre_history(
      p_order_id => NEW.order_id,
      p_action_type => 'proof_modification_requested',
      p_action_description => 'Modifications demandées sur l''épreuve v' || COALESCE(NEW.version, 1),
      p_client_action => TRUE,
      p_proof_id => NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_order_status_from_proof ON proofs;
CREATE TRIGGER trg_sync_order_status_from_proof
AFTER UPDATE ON proofs
FOR EACH ROW
EXECUTE FUNCTION sync_order_status_from_proof();

-- 4) TRIGGER POUR CRÉER ÉPREUVE AUTOMATIQUEMENT APRÈS COMMANDE
CREATE OR REPLACE FUNCTION ensure_initial_proof_after_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_cnt int;
  v_version int := 1;
  v_approval_token text := encode(extensions.gen_random_bytes(16), 'hex');
  v_validation_token text := encode(extensions.gen_random_bytes(16), 'hex');
BEGIN
  SELECT COUNT(*) INTO v_cnt FROM public.proofs WHERE order_id = NEW.id;
  IF v_cnt = 0 THEN
    -- Try to get next version if helper exists
    BEGIN
      SELECT public.get_next_proof_version(NEW.id) INTO v_version;
    EXCEPTION WHEN undefined_function THEN
      v_version := 1;
    END;

    INSERT INTO public.proofs (
      order_id, version, status, is_active, approval_token, validation_token,
      created_at, updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(v_version, 1),
      'En préparation',
      TRUE,
      v_approval_token,
      v_validation_token,
      now(),
      now()
    );

    -- Best-effort history log
    BEGIN
      PERFORM public.add_ordre_history(
        p_action_description => 'Épreuve v' || COALESCE(v_version,1) || ' créée automatiquement',
        p_action_type        => 'create_proof',
        p_order_id           => NEW.id
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_initial_proof_after_order ON orders;
CREATE TRIGGER trg_ensure_initial_proof_after_order
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION ensure_initial_proof_after_order();

-- 5) TRIGGER POUR CRÉER COMMANDE APRÈS APPROBATION SOUMISSION
CREATE OR REPLACE FUNCTION create_order_after_submission_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_order_id uuid;
  v_status_lower text;
BEGIN
  v_status_lower := lower(coalesce(NEW.status, ''));
  -- Fire when status transitions to any approved/accepted variant
  IF v_status_lower IN ('approuvée','approuvee','acceptée','acceptee','approved','accepted')
     AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Check if order already exists
    SELECT o.id INTO v_order_id
    FROM public.orders o
    WHERE o.submission_id = NEW.id
    LIMIT 1;

    IF v_order_id IS NULL THEN
      INSERT INTO public.orders (submission_id, client_id, total_price, status)
      VALUES (NEW.id, NEW.client_id, COALESCE(NEW.total_price, 0), 'En attente de l''épreuve');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_order_after_submission_approval ON submissions;
CREATE TRIGGER trg_create_order_after_submission_approval
AFTER UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION create_order_after_submission_approval();

-- 6) CONTRAINTE ACTION_TYPE ÉTENDUE (pour l'historique)
ALTER TABLE ordre_historique
DROP CONSTRAINT IF EXISTS check_action_type;

ALTER TABLE ordre_historique
ADD CONSTRAINT check_action_type
CHECK (action_type IN (
  'submission_accepted','submission_approved','create_order','create_proof',
  'send_proof','approve_proof','reject_proof','request_changes',
  'update_order_status','add_comment','proof_approved','proof_modification_requested',
  'upload_proof','start_production','complete_order','cancel_order'
));

-- 7) INDEXES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_is_archived ON submissions(is_archived);
CREATE INDEX IF NOT EXISTS idx_submissions_client_id ON submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_is_archived ON orders(is_archived);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_submission_id ON orders(submission_id);

CREATE INDEX IF NOT EXISTS idx_proofs_status ON proofs(status);
CREATE INDEX IF NOT EXISTS idx_proofs_is_archived ON proofs(is_archived);
CREATE INDEX IF NOT EXISTS idx_proofs_order_id_version ON proofs(order_id, version);
CREATE UNIQUE INDEX IF NOT EXISTS idx_proofs_proof_code_unique ON proofs(proof_code) WHERE proof_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_notifications_proof_id ON email_notifications(proof_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at);

-- 8) BACKFILL PROOF_CODE POUR LES ÉPREUVES EXISTANTES
UPDATE proofs 
SET proof_code = 'E-' || regexp_replace(o.order_number, '^[A-Z]-', '') || '-v' || lpad(proofs.version::text, 2, '0')
FROM orders o 
WHERE proofs.order_id = o.id 
  AND (proofs.proof_code IS NULL OR proofs.proof_code = '')
  AND o.order_number IS NOT NULL;

-- 9) VUES POUR FILTRAGES ARCHIVAGE
CREATE OR REPLACE VIEW v_active_submissions AS
SELECT * FROM submissions WHERE is_archived = FALSE;

CREATE OR REPLACE VIEW v_archived_submissions AS  
SELECT * FROM submissions WHERE is_archived = TRUE;

CREATE OR REPLACE VIEW v_active_orders AS
SELECT * FROM orders WHERE is_archived = FALSE;

CREATE OR REPLACE VIEW v_archived_orders AS
SELECT * FROM orders WHERE is_archived = TRUE;

CREATE OR REPLACE VIEW v_active_proofs AS
SELECT * FROM proofs WHERE is_archived = FALSE;

CREATE OR REPLACE VIEW v_archived_proofs AS
SELECT * FROM proofs WHERE is_archived = TRUE;

-- 10) FONCTION SEND PROOF NOTIFICATION (trigger amélioré)
CREATE OR REPLACE FUNCTION send_proof_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_archived = TRUE THEN
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

DROP TRIGGER IF EXISTS trg_send_proof_notification ON proofs;
CREATE TRIGGER trg_send_proof_notification
BEFORE UPDATE ON proofs
FOR EACH ROW
EXECUTE FUNCTION send_proof_notification();

-- 11) COMMENTER L'UTILISATION DES VUES DANS LES REQUÊTES
COMMENT ON VIEW v_active_submissions IS 'Vue filtrée sur les soumissions non archivées - à utiliser par défaut dans les requêtes frontend';
COMMENT ON VIEW v_archived_submissions IS 'Vue filtrée sur les soumissions archivées - pour la section "Archives"';
COMMENT ON VIEW v_active_orders IS 'Vue filtrée sur les commandes non archivées - à utiliser par défaut';
COMMENT ON VIEW v_archived_orders IS 'Vue filtrée sur les commandes archivées - pour la section "Archives"';
COMMENT ON VIEW v_active_proofs IS 'Vue filtrée sur les épreuves non archivées - à utiliser par défaut';
COMMENT ON VIEW v_archived_proofs IS 'Vue filtrée sur les épreuves archivées - pour la section "Archives"';