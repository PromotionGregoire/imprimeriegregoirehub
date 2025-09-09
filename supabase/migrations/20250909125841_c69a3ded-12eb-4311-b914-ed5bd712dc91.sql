-- CORRECTION DES DONNÉES EXISTANTES AVANT CONTRAINTE
-- Mapper les anciens action_type vers les nouveaux standards

UPDATE ordre_historique 
SET action_type = CASE 
  WHEN action_type = 'send_epreuve' THEN 'send_proof'
  WHEN action_type = 'upload_epreuve' THEN 'upload_proof'
  WHEN action_type = 'approve_epreuve' THEN 'approve_proof'
  WHEN action_type = 'reject_epreuve' THEN 'reject_proof'
  WHEN action_type = 'changement_statut_epreuve' THEN 'update_order_status'
  ELSE action_type
END
WHERE action_type IN ('send_epreuve', 'upload_epreuve', 'approve_epreuve', 'reject_epreuve', 'changement_statut_epreuve');

-- Maintenant appliquer la contrainte étendue
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