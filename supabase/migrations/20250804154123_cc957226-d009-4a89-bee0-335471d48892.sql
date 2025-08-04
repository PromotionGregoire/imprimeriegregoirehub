-- Fix search_path security issue for add_ordre_history function
CREATE OR REPLACE FUNCTION public.add_ordre_history(p_order_id uuid, p_action_type text, p_action_description text, p_metadata jsonb DEFAULT '{}'::jsonb, p_proof_id uuid DEFAULT NULL::uuid, p_client_action boolean DEFAULT false, p_created_by uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;