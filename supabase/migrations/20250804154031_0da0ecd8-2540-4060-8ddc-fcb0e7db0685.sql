-- Fix search_path security issue for get_next_proof_version function
CREATE OR REPLACE FUNCTION public.get_next_proof_version(p_order_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    RETURN COALESCE(
        (SELECT MAX(version) + 1 FROM public.proofs WHERE order_id = p_order_id),
        1
    );
END;
$function$;