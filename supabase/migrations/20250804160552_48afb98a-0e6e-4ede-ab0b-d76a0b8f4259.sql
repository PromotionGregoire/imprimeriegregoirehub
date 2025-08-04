-- Phase 3 : Standardisation des action_type en anglais
-- IMPORTANTE : Retirer d'abord la contrainte pour éviter les conflits

-- 1. Supprimer la contrainte existante
ALTER TABLE public.ordre_historique 
DROP CONSTRAINT IF EXISTS check_action_type;

-- 2. Mettre à jour les action_type existants vers l'anglais
UPDATE public.ordre_historique 
SET action_type = CASE action_type
    WHEN 'upload_epreuve' THEN 'upload_proof'
    WHEN 'send_epreuve' THEN 'send_proof'
    WHEN 'view_epreuve' THEN 'view_proof'
    WHEN 'approve_epreuve' THEN 'approve_proof'
    WHEN 'reject_epreuve' THEN 'reject_proof'
    WHEN 'add_comment' THEN 'add_comment'
    WHEN 'send_reminder' THEN 'send_reminder'
    WHEN 'start_production' THEN 'start_production'
    WHEN 'update_order' THEN 'update_order'
    WHEN 'changement_statut_epreuve' THEN 'change_proof_status'
    ELSE action_type
END
WHERE action_type IN (
    'upload_epreuve', 'send_epreuve', 'view_epreuve', 
    'approve_epreuve', 'reject_epreuve', 'changement_statut_epreuve'
);

-- 3. Ajouter la nouvelle contrainte check avec tous les action_types possibles
ALTER TABLE public.ordre_historique 
ADD CONSTRAINT check_action_type CHECK (action_type IN (
    'upload_proof',
    'send_proof',
    'view_proof',
    'approve_proof',
    'reject_proof',
    'add_comment',
    'send_reminder',
    'start_production',
    'update_order',
    'change_proof_status'
));