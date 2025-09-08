-- 1. Créer un trigger pour auto-créer une épreuve lors de la création d'une commande
CREATE OR REPLACE FUNCTION create_initial_proof_after_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_version INTEGER := 1;
BEGIN
  -- Ne rien faire s'il existe déjà des épreuves pour cette commande
  IF EXISTS (SELECT 1 FROM proofs WHERE order_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Créer l'épreuve initiale
  INSERT INTO proofs (
    order_id, 
    version, 
    status, 
    is_active,
    approval_token, 
    validation_token, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id, 
    v_version, 
    'En préparation', 
    TRUE,
    gen_random_uuid()::text, 
    gen_random_uuid()::text, 
    now(), 
    now()
  );

  -- Log dans l'historique
  PERFORM add_ordre_history(
    p_order_id => NEW.id,
    p_action_type => 'create_proof',
    p_action_description => 'Épreuve v' || v_version || ' créée automatiquement',
    p_client_action => FALSE
  );

  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_create_initial_proof_after_order ON orders;
CREATE TRIGGER trg_create_initial_proof_after_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_proof_after_order();

-- 2. Créer un trigger pour synchroniser le statut de la commande quand l'épreuve change
CREATE OR REPLACE FUNCTION sync_order_status_from_proof()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_sync_order_status_from_proof ON proofs;
CREATE TRIGGER trg_sync_order_status_from_proof
  AFTER UPDATE OF status ON proofs
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION sync_order_status_from_proof();

-- 3. Script de rattrapage : créer des épreuves pour les commandes existantes qui n'en ont pas
INSERT INTO proofs (order_id, version, status, is_active, approval_token, validation_token, created_at, updated_at)
SELECT 
  o.id, 
  1, 
  'En préparation', 
  TRUE, 
  gen_random_uuid()::text, 
  gen_random_uuid()::text, 
  now(), 
  now()
FROM orders o
LEFT JOIN proofs p ON p.order_id = o.id
WHERE p.id IS NULL;

-- 4. Corriger le statut des commandes dont l'épreuve est déjà approuvée
UPDATE orders 
SET status = 'Épreuve acceptée', updated_at = now()
WHERE id IN (
  SELECT DISTINCT o.id
  FROM orders o
  JOIN proofs p ON p.order_id = o.id
  WHERE p.status = 'Approuvée' 
    AND o.status != 'Épreuve acceptée'
);

-- Grant permissions aux triggers
GRANT EXECUTE ON FUNCTION create_initial_proof_after_order() TO service_role;
GRANT EXECUTE ON FUNCTION sync_order_status_from_proof() TO service_role;