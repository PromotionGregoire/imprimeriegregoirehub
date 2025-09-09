-- CORRECTION COMPLÈTE DES ACTION_TYPES EXISTANTS
UPDATE ordre_historique 
SET action_type = 'send_proof'
WHERE action_type = 'send_epreuve';

UPDATE ordre_historique 
SET action_type = 'update_order_status' 
WHERE action_type = 'update_order';

-- Appliquer la contrainte avec tous les types possibles
ALTER TABLE ordre_historique
DROP CONSTRAINT IF EXISTS check_action_type;

ALTER TABLE ordre_historique
ADD CONSTRAINT check_action_type
CHECK (action_type IN (
  'submission_accepted','submission_approved','create_order','create_proof',
  'send_proof','approve_proof','reject_proof','request_changes',
  'update_order_status','add_comment','proof_approved','proof_modification_requested',
  'upload_proof','start_production','complete_order','cancel_order',
  -- Ajouter d'autres valeurs legacy qui pourraient exister
  'create_submission','send_submission','approve_submission','reject_submission',
  'assign_user','send_reminder','update_status','view_proof'
));