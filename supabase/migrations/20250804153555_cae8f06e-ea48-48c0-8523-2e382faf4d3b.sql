-- Compléter le système d'historique des épreuves - Phase 1 avancée

-- 1. Ajouter contrainte sur action_type (on vérifie d'abord si elle existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'check_action_type' 
                   AND table_name = 'ordre_historique') THEN
        ALTER TABLE public.ordre_historique 
        ADD CONSTRAINT check_action_type CHECK (action_type IN (
            'upload_epreuve',
            'send_epreuve', 
            'view_epreuve',
            'approve_epreuve',
            'reject_epreuve',
            'add_comment',
            'send_reminder',
            'start_production',
            'update_order',
            'changement_statut_epreuve'
        ));
    END IF;
END $$;

-- 2. Créer les index manquants pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_ordre_historique_action_type ON public.ordre_historique(action_type);

-- 3. Améliorer la table epreuve_commentaires
ALTER TABLE public.epreuve_commentaires 
ADD COLUMN IF NOT EXISTS created_by_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);

-- Renommer commentaire en comment_text pour cohérence
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'epreuve_commentaires' AND column_name = 'commentaire') THEN
        ALTER TABLE public.epreuve_commentaires RENAME COLUMN commentaire TO comment_text;
    END IF;
END $$;

-- 4. Améliorer la table proofs avec des colonnes pour le tracking
ALTER TABLE public.proofs 
ADD COLUMN IF NOT EXISTS uploaded_by UUID,
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Créer la vue pour faciliter la lecture de l'historique
CREATE OR REPLACE VIEW public.v_ordre_historique AS
SELECT 
    oh.id,
    oh.order_id,
    oh.proof_id,
    oh.action_type,
    oh.action_description,
    oh.metadata,
    oh.client_action,
    oh.created_at,
    TO_CHAR(oh.created_at, 'DD/MM/YYYY à HH24:MI') as formatted_date,
    -- Joindre les informations de l'ordre
    o.order_number,
    o.client_id,
    -- Joindre les informations de l'épreuve si applicable
    p.version as proof_version,
    p.status as proof_status,
    -- Joindre les informations de l'utilisateur qui a créé l'action
    pr.full_name as created_by_name,
    pr.email as created_by_email,
    -- Joindre les informations du client
    c.business_name,
    c.contact_name
FROM public.ordre_historique oh
LEFT JOIN public.orders o ON oh.order_id = o.id
LEFT JOIN public.proofs p ON oh.proof_id = p.id
LEFT JOIN public.profiles pr ON oh.created_by = pr.id
LEFT JOIN public.clients c ON o.client_id = c.id
ORDER BY oh.created_at DESC;

-- 6. Fonction utilitaire pour obtenir le numéro de version suivant
CREATE OR REPLACE FUNCTION public.get_next_proof_version(p_order_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT MAX(version) + 1 FROM public.proofs WHERE order_id = p_order_id),
        1
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Améliorer la fonction add_ordre_history existante
CREATE OR REPLACE FUNCTION public.add_ordre_history(
    p_order_id UUID,
    p_action_type TEXT,
    p_action_description TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_proof_id UUID DEFAULT NULL,
    p_client_action BOOLEAN DEFAULT false,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_history_id UUID;
    v_created_by UUID;
BEGIN
    -- Utiliser auth.uid() si p_created_by est NULL
    v_created_by := COALESCE(p_created_by, auth.uid());

    -- Insérer l'entrée dans l'historique
    INSERT INTO public.ordre_historique (
        order_id,
        proof_id,
        action_type,
        action_description,
        metadata,
        client_action,
        created_by
    ) VALUES (
        p_order_id,
        p_proof_id,
        p_action_type,
        p_action_description,
        p_metadata,
        p_client_action,
        v_created_by
    ) RETURNING id INTO v_history_id;
    
    RETURN v_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer une fonction pour récupérer l'historique d'une commande spécifique
CREATE OR REPLACE FUNCTION public.get_order_history(p_order_id UUID)
RETURNS TABLE (
    id UUID,
    action_type TEXT,
    action_description TEXT,
    formatted_date TEXT,
    created_by_name TEXT,
    client_action BOOLEAN,
    proof_version INTEGER,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.action_type,
        h.action_description,
        h.formatted_date,
        h.created_by_name,
        h.client_action,
        h.proof_version,
        h.metadata
    FROM public.v_ordre_historique h
    WHERE h.order_id = p_order_id
    ORDER BY h.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;