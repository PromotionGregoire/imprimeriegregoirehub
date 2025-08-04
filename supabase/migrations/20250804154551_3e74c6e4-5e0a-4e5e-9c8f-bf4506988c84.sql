-- PHASE 2 : L'AUTOMATISATION (LOGIQUE BACKEND)
-- Création des triggers pour automatiser l'historique

-- 1. Créer la fonction de trigger pour l'upload d'épreuves
CREATE OR REPLACE FUNCTION public.log_proof_upload()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO ''
AS $$
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

    -- Appeler la fonction add_ordre_history
    PERFORM public.add_ordre_history(
        p_order_id := NEW.order_id,
        p_action_type := 'upload_epreuve',
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
$$;

-- 2. Créer le trigger AFTER INSERT sur la table proofs
DROP TRIGGER IF EXISTS trigger_log_proof_upload ON public.proofs;
CREATE TRIGGER trigger_log_proof_upload
    AFTER INSERT ON public.proofs
    FOR EACH ROW
    EXECUTE FUNCTION public.log_proof_upload();

-- 3. Créer une fonction de trigger pour les mises à jour de statut
CREATE OR REPLACE FUNCTION public.log_proof_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO ''
AS $$
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
                v_action_type := 'approve_epreuve';
                v_action_description := 'Épreuve approuvée';
            WHEN 'Modification demandée' THEN
                v_action_type := 'reject_epreuve';
                v_action_description := 'Modifications demandées sur l''épreuve';
            WHEN 'Envoyée au client' THEN
                v_action_type := 'send_epreuve';
                v_action_description := 'Épreuve envoyée au client pour approbation';
            ELSE
                -- Logger aussi les autres changements de statut
                v_action_type := 'changement_statut_epreuve';
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
$$;

-- 4. Créer le trigger pour les changements de statut
DROP TRIGGER IF EXISTS trigger_log_proof_status_change ON public.proofs;
CREATE TRIGGER trigger_log_proof_status_change
    AFTER UPDATE ON public.proofs
    FOR EACH ROW
    EXECUTE FUNCTION public.log_proof_status_change();

-- 5. Trigger pour les commentaires ajoutés
CREATE OR REPLACE FUNCTION public.log_comment_added()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO ''
AS $$
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
$$;

-- 6. Créer le trigger pour les commentaires
DROP TRIGGER IF EXISTS trigger_log_comment_added ON public.epreuve_commentaires;
CREATE TRIGGER trigger_log_comment_added
    AFTER INSERT ON public.epreuve_commentaires
    FOR EACH ROW
    EXECUTE FUNCTION public.log_comment_added();

-- 7. Trigger pour les changements de statut des commandes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO ''
AS $$
DECLARE
    v_user_name VARCHAR(255);
BEGIN
    -- Ne logger que si le statut a changé
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Récupérer le nom de l'utilisateur
        SELECT COALESCE(full_name, email) INTO v_user_name
        FROM public.profiles
        WHERE id = auth.uid();

        -- Logger le changement
        PERFORM public.add_ordre_history(
            p_order_id := NEW.id,
            p_action_type := 'update_order',
            p_action_description := 'Statut de la commande changé de "' || OLD.status || '" à "' || NEW.status || '"',
            p_metadata := jsonb_build_object(
                'oldStatus', OLD.status,
                'newStatus', NEW.status,
                'orderNumber', NEW.order_number,
                'changedBy', v_user_name,
                'changedAt', NOW()
            ),
            p_client_action := false,
            p_created_by := auth.uid()
        );

        -- Si le statut passe à "En production", logger le démarrage de production
        IF NEW.status = 'En production' THEN
            PERFORM public.add_ordre_history(
                p_order_id := NEW.id,
                p_action_type := 'start_production',
                p_action_description := 'Production démarrée pour la commande ' || NEW.order_number,
                p_metadata := jsonb_build_object(
                    'orderNumber', NEW.order_number,
                    'startedBy', v_user_name,
                    'startedAt', NOW()
                ),
                p_client_action := false,
                p_created_by := auth.uid()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 8. Créer le trigger pour les commandes
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON public.orders;
CREATE TRIGGER trigger_log_order_status_change
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.log_order_status_change();

-- 9. Fonction de test pour vérifier que tout fonctionne
CREATE OR REPLACE FUNCTION public.test_history_triggers()
RETURNS TABLE(
    test_name TEXT,
    test_result BOOLEAN,
    test_message TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO ''
AS $$
DECLARE
    v_test_order_id UUID;
    v_test_proof_id UUID;
    v_test_client_id UUID;
    v_test_submission_id UUID;
    v_history_count INTEGER;
    v_initial_count INTEGER;
BEGIN
    -- Compter les entrées initiales
    SELECT COUNT(*) INTO v_initial_count FROM public.ordre_historique;

    -- Récupérer ou créer un client de test
    SELECT id INTO v_test_client_id FROM public.clients LIMIT 1;
    
    IF v_test_client_id IS NULL THEN
        INSERT INTO public.clients (business_name, contact_name, email, phone_number)
        VALUES ('Test Company', 'Test Contact', 'test@example.com', '1234567890')
        RETURNING id INTO v_test_client_id;
    END IF;

    -- Créer une soumission de test
    INSERT INTO public.submissions (client_id, status)
    VALUES (v_test_client_id, 'Brouillon')
    RETURNING id INTO v_test_submission_id;

    -- Créer une commande de test
    INSERT INTO public.orders (client_id, submission_id, total_price, status)
    VALUES (
        v_test_client_id,
        v_test_submission_id,
        100.00,
        'En attente de l''épreuve'
    ) RETURNING id INTO v_test_order_id;

    -- Test 1: Upload d'épreuve
    INSERT INTO public.proofs (
        order_id,
        file_url,
        version,
        status,
        uploaded_by
    ) VALUES (
        v_test_order_id,
        'https://example.com/test-trigger-proof.pdf',
        1,
        'A preparer',
        auth.uid()
    ) RETURNING id INTO v_test_proof_id;

    -- Vérifier l'historique
    SELECT COUNT(*) INTO v_history_count
    FROM public.ordre_historique
    WHERE order_id = v_test_order_id
    AND action_type = 'upload_epreuve';

    RETURN QUERY
    SELECT 
        'Upload trigger test'::TEXT,
        v_history_count >= 1,
        'Upload logged: ' || v_history_count || ' entries';

    -- Test 2: Changement de statut
    UPDATE public.proofs 
    SET status = 'Approuvée'
    WHERE id = v_test_proof_id;

    SELECT COUNT(*) INTO v_history_count
    FROM public.ordre_historique
    WHERE order_id = v_test_order_id
    AND action_type = 'approve_epreuve';

    RETURN QUERY
    SELECT 
        'Status change trigger test'::TEXT,
        v_history_count >= 1,
        'Status change logged: ' || v_history_count || ' entries';

    -- Nettoyer
    DELETE FROM public.orders WHERE id = v_test_order_id;
    DELETE FROM public.submissions WHERE id = v_test_submission_id;

    RETURN QUERY
    SELECT 
        'Overall test'::TEXT,
        true,
        'Tests completed successfully. Initial entries: ' || v_initial_count;
END;
$$;

-- 10. Ajouter des commentaires pour la documentation
COMMENT ON FUNCTION public.log_proof_upload() IS 'Trigger function pour logger automatiquement les uploads d''épreuves';
COMMENT ON FUNCTION public.log_proof_status_change() IS 'Trigger function pour logger les changements de statut des épreuves';
COMMENT ON FUNCTION public.log_comment_added() IS 'Trigger function pour logger l''ajout de commentaires';
COMMENT ON FUNCTION public.log_order_status_change() IS 'Trigger function pour logger les changements de statut des commandes';
COMMENT ON FUNCTION public.test_history_triggers() IS 'Fonction de test pour vérifier le bon fonctionnement des triggers d''historique';