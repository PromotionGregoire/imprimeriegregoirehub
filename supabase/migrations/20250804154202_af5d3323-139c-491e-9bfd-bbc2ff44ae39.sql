-- Fix search_path security issue for get_order_history function
CREATE OR REPLACE FUNCTION public.get_order_history(p_order_id uuid)
 RETURNS TABLE(id uuid, action_type text, action_description text, formatted_date text, created_by_name text, client_action boolean, proof_version integer, metadata jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;