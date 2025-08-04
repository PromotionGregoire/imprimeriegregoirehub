-- Create function to get latest proofs by order
CREATE OR REPLACE FUNCTION public.get_latest_proofs_by_order()
RETURNS TABLE (
    id uuid,
    order_id uuid,
    status text,
    version integer,
    created_at timestamp with time zone,
    orders jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (p.order_id)
        p.id,
        p.order_id,
        p.status,
        p.version,
        p.created_at,
        jsonb_build_object(
            'order_number', o.order_number,
            'clients', jsonb_build_object(
                'business_name', c.business_name,
                'contact_name', c.contact_name
            )
        ) as orders
    FROM public.proofs p
    JOIN public.orders o ON p.order_id = o.id
    JOIN public.submissions s ON o.submission_id = s.id
    JOIN public.clients c ON s.client_id = c.id
    WHERE p.status != 'Approuvée'
    ORDER BY p.order_id, p.version DESC;
END;
$function$;