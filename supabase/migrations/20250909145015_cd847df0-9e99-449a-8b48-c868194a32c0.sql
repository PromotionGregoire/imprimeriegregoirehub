-- Corriger les triggers pour utiliser un statut valide
CREATE OR REPLACE FUNCTION public.set_order_status_on_proof_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF LOWER(NEW.status) IN ('approved', 'approuvée', 'approuvee', 'valide', 'validé', 'validée')
     AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE orders
      SET status = 'En production',  -- ✅ Statut valide dans la contrainte
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
$function$;

CREATE OR REPLACE FUNCTION public.sync_order_status_from_proof()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Si l'épreuve passe à "Approuvée", mettre la commande en production
  IF NEW.status = 'Approuvée' AND (OLD.status IS NULL OR OLD.status != 'Approuvée') THEN
    UPDATE orders
    SET status = 'En production',  -- ✅ Statut valide dans la contrainte
        updated_at = now()
    WHERE id = NEW.order_id;

    -- Log dans l'historique
    PERFORM add_ordre_history(
      p_order_id => NEW.order_id,
      p_action_type => 'proof_approved',
      p_action_description => 'Épreuve v' || COALESCE(NEW.version, 1) || ' approuvée - Commande mise en production',
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
$function$;