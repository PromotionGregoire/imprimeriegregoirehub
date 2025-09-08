-- Fix potential SECURITY DEFINER views by recreating them explicitly without SECURITY DEFINER
-- This addresses the security linter warnings about views with SECURITY DEFINER property

-- Drop and recreate dashboard_metrics_view
DROP VIEW IF EXISTS public.dashboard_metrics_view;
CREATE VIEW public.dashboard_metrics_view AS 
SELECT 
    (SELECT count(*) FROM submissions WHERE status = 'pending') AS pending_submissions,
    (SELECT count(*) FROM orders WHERE status = ANY(ARRAY['in_production', 'quality_check', 'ready_for_delivery'])) AS active_orders,
    (SELECT count(*) FROM proofs WHERE status = 'pending') AS pending_proofs;

-- Drop and recreate payments_last_30d view
DROP VIEW IF EXISTS public.payments_last_30d;
CREATE VIEW public.payments_last_30d AS
SELECT 
    date_trunc('day', received_at) AS day,
    sum(amount) AS total
FROM payments
WHERE received_at >= (now() - interval '30 days')
GROUP BY date_trunc('day', received_at)
ORDER BY date_trunc('day', received_at);

-- Drop and recreate v_order_history_details view
DROP VIEW IF EXISTS public.v_order_history_details;
CREATE VIEW public.v_order_history_details AS
SELECT 
    h.id,
    h.order_id,
    h.action_type,
    h.action_description,
    h.created_at,
    h.client_action,
    h.metadata,
    h.proof_id,
    COALESCE(p.full_name, 'Client') AS author_name,
    p.full_name AS employee_full_name,
    p.job_title AS employee_job_title
FROM ordre_historique h
LEFT JOIN profiles p ON h.created_by = p.id;

-- Drop and recreate v_ordre_historique view
DROP VIEW IF EXISTS public.v_ordre_historique;
CREATE VIEW public.v_ordre_historique AS
SELECT 
    h.id,
    h.order_id,
    h.action_type,
    h.action_description,
    h.created_at,
    h.client_action,
    h.metadata,
    h.proof_id,
    to_char(h.created_at, 'DD/MM/YYYY à HH24:MI') AS formatted_date,
    CASE 
        WHEN h.client_action THEN 'Client'
        ELSE COALESCE(p.full_name, 'Système')
    END AS created_by_name,
    CASE 
        WHEN h.client_action THEN c.email
        ELSE p.email
    END AS created_by_email,
    o.order_number,
    c.business_name,
    c.contact_name,
    c.id AS client_id,
    pr.version AS proof_version,
    pr.status AS proof_status
FROM ordre_historique h
LEFT JOIN profiles p ON h.created_by = p.id
LEFT JOIN orders o ON h.order_id = o.id
LEFT JOIN submissions s ON o.submission_id = s.id
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN proofs pr ON h.proof_id = pr.id;