-- Corriger la fonction log_proof_upload pour utiliser le bon action_type
CREATE OR REPLACE FUNCTION public.log_proof_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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

    -- Appeler la fonction add_ordre_history avec le bon action_type
    PERFORM public.add_ordre_history(
        p_order_id := NEW.order_id,
        p_action_type := 'upload_proof',  -- Changé de 'upload_epreuve' à 'upload_proof'
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
$function$;