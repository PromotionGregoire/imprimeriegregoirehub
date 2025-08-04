-- Phase 3 : Standardisation des action_type en anglais
-- IMPORTANT : Faire un backup avant d'exécuter

-- 1. Mettre à jour les action_type existants
UPDATE public.ordre_historique 
SET action_type = CASE action_type
    WHEN 'upload_epreuve' THEN 'upload_proof'
    WHEN 'send_epreuve' THEN 'send_proof'
    WHEN 'view_epreuve' THEN 'view_proof'
    WHEN 'approve_epreuve' THEN 'approve_proof'
    WHEN 'reject_epreuve' THEN 'reject_proof'
    WHEN 'add_comment' THEN 'add_comment' -- Déjà en anglais
    WHEN 'send_reminder' THEN 'send_reminder' -- Déjà en anglais
    WHEN 'start_production' THEN 'start_production' -- Déjà en anglais
    WHEN 'update_order' THEN 'update_order' -- Déjà en anglais
    WHEN 'changement_statut_epreuve' THEN 'change_proof_status'
    ELSE action_type
END
WHERE action_type IN (
    'upload_epreuve', 'send_epreuve', 'view_epreuve', 
    'approve_epreuve', 'reject_epreuve', 'changement_statut_epreuve'
);

-- 2. Mettre à jour la contrainte check si elle existe
ALTER TABLE public.ordre_historique 
DROP CONSTRAINT IF EXISTS check_action_type;

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

-- 3. Mettre à jour les fonctions de trigger pour utiliser les nouveaux action_type
CREATE OR REPLACE FUNCTION public.log_proof_upload()
RETURNS TRIGGER AS $$
DECLARE
    v_user_name VARCHAR(255);
    v_version_text VARCHAR(100);
    v_order_number VARCHAR(50);
BEGIN
    -- Récupérer le numéro de commande pour un message plus descriptif
    SELECT order_number INTO v_order_number
    FROM public.orders
    WHERE id = NEW.order_id;

    -- Récupérer le nom de l'utilisateur qui a uploadé (si disponible)
    IF NEW.uploaded_by IS NOT NULL THEN
        SELECT COALESCE(full_name, email) INTO v_user_name
        FROM public.profiles
        WHERE id = NEW.uploaded_by;
    ELSE
        -- Si uploaded_by est NULL, essayer d'utiliser auth.uid()
        SELECT COALESCE(full_name, email) INTO v_user_name
        FROM public.profiles
        WHERE id = auth.uid();
    END IF;

    -- Construire le texte de version
    v_version_text := CASE 
        WHEN NEW.version = 1 THEN 'Version initiale'
        ELSE 'Version ' || NEW.version
    END;

    -- Appeler la fonction add_ordre_history avec le nouveau action_type
    PERFORM public.add_ordre_history(
        p_order_id := NEW.order_id,
        p_action_type := 'upload_proof',
        p_action_description := v_version_text || ' de l''épreuve téléversée' || 
                               CASE 
                                   WHEN v_user_name IS NOT NULL 
                                   THEN ' par ' || v_user_name 
                                   ELSE '' 
                               END ||
                               ' pour la commande ' || COALESCE(v_order_number, NEW.order_id::text),
        p_metadata := jsonb_build_object(
            'version', NEW.version,
            'fileName', NEW.file_url,
            'uploadedAt', COALESCE(NEW.uploaded_at, NEW.created_at),
            'uploadedBy', v_user_name,
            'orderNumber', v_order_number,
            'status', NEW.status
        ),
        p_proof_id := NEW.id,
        p_client_action := false,
        p_created_by := COALESCE(NEW.uploaded_by, auth.uid())
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 4. Mettre à jour la fonction de changement de statut d'épreuve
CREATE OR REPLACE FUNCTION public.log_proof_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_action_type VARCHAR(50);
    v_action_description TEXT;
    v_user_name VARCHAR(255);
BEGIN
    -- Ne logger que si le statut a changé
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Récupérer le nom de l'utilisateur actuel
        SELECT COALESCE(full_name, email) INTO v_user_name
        FROM public.profiles
        WHERE id = auth.uid();

        -- Déterminer le type d'action basé sur le nouveau statut
        CASE NEW.status
            WHEN 'Approuvée' THEN
                v_action_type := 'approve_proof';
                v_action_description := 'Épreuve approuvée';
            WHEN 'Modification demandée' THEN
                v_action_type := 'reject_proof';
                v_action_description := 'Modifications demandées sur l''épreuve';
            WHEN 'Envoyée au client' THEN
                v_action_type := 'send_proof';
                v_action_description := 'Épreuve envoyée au client pour approbation';
            ELSE
                -- Logger aussi les autres changements de statut
                v_action_type := 'change_proof_status';
                v_action_description := 'Statut de l''épreuve changé de "' || COALESCE(OLD.status, 'nouveau') || '" à "' || NEW.status || '"';
        END CASE;

        -- Logger le changement
        PERFORM public.add_ordre_history(
            p_order_id := NEW.order_id,
            p_action_type := v_action_type,
            p_action_description := v_action_description,
            p_metadata := jsonb_build_object(
                'oldStatus', OLD.status,
                'newStatus', NEW.status,
                'version', NEW.version,
                'changedAt', NOW(),
                'changedBy', v_user_name
            ),
            p_proof_id := NEW.id,
            p_client_action := CASE 
                WHEN NEW.status IN ('Approuvée', 'Modification demandée') THEN true 
                ELSE false 
            END,
            p_created_by := auth.uid()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 5. Mettre à jour la fonction de commentaire
CREATE OR REPLACE FUNCTION public.log_comment_added()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id UUID;
    v_order_number VARCHAR(50);
BEGIN
    -- Récupérer l'order_id depuis la proof
    SELECT p.order_id, o.order_number 
    INTO v_order_id, v_order_number
    FROM public.proofs p
    JOIN public.orders o ON p.order_id = o.id
    WHERE p.id = NEW.proof_id;

    -- Logger l'ajout du commentaire
    PERFORM public.add_ordre_history(
        p_order_id := v_order_id,
        p_action_type := 'add_comment',
        p_action_description := 'Commentaire ajouté' || 
                               CASE 
                                   WHEN NEW.created_by_client THEN ' par le client'
                                   ELSE ' par un employé'
                               END,
        p_metadata := jsonb_build_object(
            'comment', LEFT(NEW.comment_text, 200), -- Limiter à 200 caractères dans les metadata
            'fullComment', NEW.comment_text,
            'createdByEmail', NEW.created_by_email,
            'createdByName', NEW.created_by_name,
            'isClientComment', NEW.created_by_client,
            'isModificationRequest', NEW.is_modification_request
        ),
        p_proof_id := NEW.proof_id,
        p_client_action := NEW.created_by_client,
        p_created_by := NULL -- Les commentaires peuvent venir de clients non authentifiés
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';