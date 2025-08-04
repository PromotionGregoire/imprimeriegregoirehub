-- Étape 1: Fondation de la Base de Données pour le Nouveau Système d'Historique des Épreuves

-- 1. Amélioration de la table proofs (epreuves)
-- Note: created_at, updated_at et version existent déjà
ALTER TABLE public.proofs 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS validation_token TEXT;

-- Mettre à jour les épreuves existantes pour qu'elles soient actives par défaut
UPDATE public.proofs SET is_active = true WHERE is_active IS NULL;

-- 2. Création de la table ordre_historique
CREATE TABLE IF NOT EXISTS public.ordre_historique (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'creation_commande', 'upload_epreuve', 'envoi_client', 'approbation', 'rejet', 'modification_demandee'
    action_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}', -- Données flexibles selon le type d'action
    proof_id UUID REFERENCES public.proofs(id) ON DELETE SET NULL,
    client_action BOOLEAN DEFAULT false -- true si l'action vient du client
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_ordre_historique_order_id ON public.ordre_historique(order_id);
CREATE INDEX IF NOT EXISTS idx_ordre_historique_created_at ON public.ordre_historique(created_at);
CREATE INDEX IF NOT EXISTS idx_ordre_historique_action_type ON public.ordre_historique(action_type);

-- 3. Création de la table epreuve_commentaires
CREATE TABLE IF NOT EXISTS public.epreuve_commentaires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proof_id UUID NOT NULL REFERENCES public.proofs(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    commentaire TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by_client BOOLEAN DEFAULT false, -- true si commentaire vient du client
    client_name TEXT, -- Nom du client si commentaire client
    is_modification_request BOOLEAN DEFAULT false -- true si c'est une demande de modification
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_epreuve_commentaires_proof_id ON public.epreuve_commentaires(proof_id);
CREATE INDEX IF NOT EXISTS idx_epreuve_commentaires_order_id ON public.epreuve_commentaires(order_id);

-- 4. Fonction pour ajouter automatiquement un historique
CREATE OR REPLACE FUNCTION public.add_ordre_history(
    p_order_id UUID,
    p_action_type TEXT,
    p_action_description TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_proof_id UUID DEFAULT NULL,
    p_client_action BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 5. RLS (Row Level Security) pour les nouvelles tables
ALTER TABLE public.ordre_historique ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epreuve_commentaires ENABLE ROW LEVEL SECURITY;

-- Politique pour ordre_historique (utilisateurs authentifiés peuvent voir l'historique)
CREATE POLICY "Authenticated users can view order history" 
ON public.ordre_historique 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert order history" 
ON public.ordre_historique 
FOR INSERT 
WITH CHECK (true);

-- Politique pour epreuve_commentaires (utilisateurs authentifiés peuvent gérer les commentaires)
CREATE POLICY "Authenticated users can manage proof comments" 
ON public.epreuve_commentaires 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 6. Trigger pour automatiquement enregistrer les changements de statut des épreuves
CREATE OR REPLACE FUNCTION public.log_proof_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_log_proof_status_change ON public.proofs;
CREATE TRIGGER trigger_log_proof_status_change
    AFTER UPDATE ON public.proofs
    FOR EACH ROW
    EXECUTE FUNCTION public.log_proof_status_change();