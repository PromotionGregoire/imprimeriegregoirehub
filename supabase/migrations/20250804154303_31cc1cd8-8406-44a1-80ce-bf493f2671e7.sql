-- Fix security definer issue for v_ordre_historique view
-- First, let's see the current view definition and then recreate it with security_invoker
DROP VIEW IF EXISTS public.v_ordre_historique;

-- Recreate the view with SECURITY INVOKER (safer option)
CREATE VIEW public.v_ordre_historique 
WITH (security_invoker=true) AS
SELECT 
    h.id,
    h.order_id,
    h.proof_id,
    h.action_type,
    h.action_description,
    h.metadata,
    h.client_action,
    h.created_at,
    -- Format the date in French
    CASE 
        WHEN h.created_at::date = CURRENT_DATE THEN 
            'Aujourd''hui à ' || TO_CHAR(h.created_at, 'HH24:MI')
        WHEN h.created_at::date = CURRENT_DATE - INTERVAL '1 day' THEN 
            'Hier à ' || TO_CHAR(h.created_at, 'HH24:MI')
        ELSE 
            TO_CHAR(h.created_at, 'DD/MM/YYYY à HH24:MI')
    END as formatted_date,
    -- Get proof version if proof_id exists
    p.version as proof_version,
    p.status as proof_status,
    -- Get employee name if created_by exists
    CASE 
        WHEN h.client_action = true THEN 
            COALESCE(c.contact_name, 'Client')
        ELSE 
            prof.full_name
    END as created_by_name,
    -- Get employee email for contact
    prof.email as created_by_email,
    -- Get client information
    c.business_name,
    c.contact_name,
    o.client_id,
    o.order_number
FROM public.ordre_historique h
LEFT JOIN public.proofs p ON h.proof_id = p.id
LEFT JOIN public.orders o ON h.order_id = o.id
LEFT JOIN public.submissions s ON o.submission_id = s.id
LEFT JOIN public.clients c ON s.client_id = c.id
LEFT JOIN public.profiles prof ON h.created_by = prof.id;