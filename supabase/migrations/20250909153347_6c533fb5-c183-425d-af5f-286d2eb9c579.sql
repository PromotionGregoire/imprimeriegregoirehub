-- Mettre à jour la fonction get_latest_proofs_by_order pour inclure les human_id des épreuves
CREATE OR REPLACE FUNCTION public.get_latest_proofs_by_order()
RETURNS TABLE(
    id uuid, 
    order_id uuid, 
    status text, 
    version integer, 
    created_at timestamp with time zone, 
    human_id text,
    human_year integer,
    human_seq integer,
    orders jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Only allow authenticated users with proper roles
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    IF NOT is_admin_or_manager() THEN
        RAISE EXCEPTION 'Access denied: Admin or Manager privileges required';
    END IF;

    RETURN QUERY
    SELECT DISTINCT ON (p.order_id)
        p.id,
        p.order_id,
        p.status,
        p.version,
        p.created_at,
        p.human_id,
        p.human_year,
        p.human_seq,
        jsonb_build_object(
            'order_number', o.order_number,
            'human_id', o.human_id,
            'clients', jsonb_build_object(
                'business_name', c.business_name,
                'contact_name', c.contact_name
            )
        ) as orders
    FROM public.proofs p
    JOIN public.orders o ON p.order_id = o.id
    JOIN public.submissions s ON o.submission_id = s.id
    JOIN public.clients c ON s.client_id = c.id
    WHERE p.archived_at IS NULL
    AND p.status != 'Approuvée'
    ORDER BY p.order_id, p.version DESC;
END;
$function$