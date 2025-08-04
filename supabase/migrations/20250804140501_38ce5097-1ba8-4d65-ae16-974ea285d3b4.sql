-- PHASE 2 : L'AUTOMATISATION (LOGIQUE BACKEND)
-- Trigger pour tracer automatiquement les téléversements d'épreuves

-- 1. Création de la fonction trigger pour les nouveaux téléversements d'épreuves
CREATE OR REPLACE FUNCTION public.log_proof_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Enregistrer automatiquement l'événement de téléversement dans l'historique
    PERFORM add_ordre_history(
        NEW.order_id,                                                    -- p_order_id
        'upload_epreuve',                                               -- p_action_type
        'Version ' || NEW.version || ' de l''épreuve téléversée.',     -- p_action_description
        jsonb_build_object(                                             -- p_metadata
            'version', NEW.version,
            'fileName', NEW.file_url,
            'status', NEW.status,
            'approval_token', NEW.approval_token
        ),
        NEW.id,                                                         -- p_proof_id
        false                                                           -- p_client_action (action employé)
    );
    
    RETURN NEW;
END;
$$;

-- 2. Création du trigger AFTER INSERT sur la table proofs
DROP TRIGGER IF EXISTS trigger_log_proof_upload ON public.proofs;
CREATE TRIGGER trigger_log_proof_upload
    AFTER INSERT ON public.proofs
    FOR EACH ROW
    EXECUTE FUNCTION public.log_proof_upload();

-- 3. Commentaire explicatif
COMMENT ON FUNCTION public.log_proof_upload() IS 'Fonction trigger qui enregistre automatiquement dans ordre_historique chaque nouveau téléversement d''épreuve';
COMMENT ON TRIGGER trigger_log_proof_upload ON public.proofs IS 'Trigger qui trace automatiquement les nouveaux téléversements d''épreuves dans l''historique de la commande';