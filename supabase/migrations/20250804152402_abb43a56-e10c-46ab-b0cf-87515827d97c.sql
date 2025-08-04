-- Phase 1 : Fondation de la base de données pour le système d'épreuves

-- 1. Créer la table ordre_historique pour l'historique des actions
CREATE TABLE IF NOT EXISTS public.ordre_historique (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    proof_id UUID NULL,
    action_type TEXT NOT NULL,
    action_description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    client_action BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NULL
);

-- 2. Créer la table epreuve_commentaires pour les commentaires clients
CREATE TABLE IF NOT EXISTS public.epreuve_commentaires (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proof_id UUID NOT NULL,
    order_id UUID NOT NULL,
    commentaire TEXT NOT NULL,
    client_name TEXT NULL,
    is_modification_request BOOLEAN DEFAULT false,
    created_by_client BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Améliorer la table proofs avec les colonnes nécessaires
ALTER TABLE public.proofs 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS validation_token TEXT NULL;

-- 4. Créer la fonction add_ordre_history pour faciliter l'ajout d'entrées
CREATE OR REPLACE FUNCTION public.add_ordre_history(
    p_order_id UUID,
    p_action_type TEXT,
    p_action_description TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_proof_id UUID DEFAULT NULL,
    p_client_action BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    history_id UUID;
BEGIN
    INSERT INTO public.ordre_historique (
        order_id,
        action_type,
        action_description,
        metadata,
        proof_id,
        client_action,
        created_by
    ) VALUES (
        p_order_id,
        p_action_type,
        p_action_description,
        p_metadata,
        p_proof_id,
        p_client_action,
        CASE WHEN p_client_action THEN NULL ELSE auth.uid() END
    ) RETURNING id INTO history_id;
    
    RETURN history_id;
END;
$$;

-- 5. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_ordre_historique_order_id ON public.ordre_historique(order_id);
CREATE INDEX IF NOT EXISTS idx_ordre_historique_proof_id ON public.ordre_historique(proof_id);
CREATE INDEX IF NOT EXISTS idx_ordre_historique_created_at ON public.ordre_historique(created_at);
CREATE INDEX IF NOT EXISTS idx_epreuve_commentaires_proof_id ON public.epreuve_commentaires(proof_id);
CREATE INDEX IF NOT EXISTS idx_epreuve_commentaires_order_id ON public.epreuve_commentaires(order_id);

-- 6. Configurer les politiques RLS pour ordre_historique
ALTER TABLE public.ordre_historique ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view order history" ON public.ordre_historique;
CREATE POLICY "Users can view order history" ON public.ordre_historique
FOR SELECT USING (true);

-- 7. Configurer les politiques RLS pour epreuve_commentaires
ALTER TABLE public.epreuve_commentaires ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage proof comments" ON public.epreuve_commentaires;
CREATE POLICY "Authenticated users can manage proof comments" ON public.epreuve_commentaires
FOR ALL USING (true) WITH CHECK (true);

-- 8. Mettre à jour les politiques de la table proofs si nécessaire
DROP POLICY IF EXISTS "Public access to proofs with valid validation token" ON public.proofs;
CREATE POLICY "Public access to proofs with valid validation token" ON public.proofs
FOR SELECT USING (
    validation_token IS NOT NULL 
    AND validation_token <> '' 
    AND is_active = true
);

-- 9. Créer un trigger pour automatiser l'historique lors des changements de statut
CREATE OR REPLACE FUNCTION public.log_proof_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Si le statut change, enregistrer dans l'historique
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM add_ordre_history(
            NEW.order_id,
            'changement_statut_epreuve',
            'Statut de l''épreuve changé de "' || COALESCE(OLD.status, 'Nouveau') || '" à "' || NEW.status || '"',
            jsonb_build_object(
                'ancien_statut', OLD.status,
                'nouveau_statut', NEW.status,
                'version', NEW.version
            ),
            NEW.id,
            false
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 10. Attacher le trigger à la table proofs
DROP TRIGGER IF EXISTS trigger_log_proof_status_change ON public.proofs;
CREATE TRIGGER trigger_log_proof_status_change
    AFTER UPDATE ON public.proofs
    FOR EACH ROW
    EXECUTE FUNCTION public.log_proof_status_change();

-- 11. Créer un trigger pour automatiser l'historique lors de l'upload d'épreuves
CREATE OR REPLACE FUNCTION public.log_proof_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 12. Attacher le trigger pour l'upload d'épreuves
DROP TRIGGER IF EXISTS trigger_log_proof_upload ON public.proofs;
CREATE TRIGGER trigger_log_proof_upload
    AFTER INSERT ON public.proofs
    FOR EACH ROW
    EXECUTE FUNCTION public.log_proof_upload();