-- Fix ambiguous column reference in get_latest_proofs_by_order function
DROP FUNCTION IF EXISTS public.get_latest_proofs_by_order();

CREATE OR REPLACE FUNCTION public.get_latest_proofs_by_order()
RETURNS TABLE(
    id uuid,
    order_id uuid,
    status text,
    version integer,
    created_at timestamptz,
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
  -- Ensure authenticated and proper role
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT is_admin_or_manager() THEN
    RAISE EXCEPTION 'Access denied: Admin or Manager privileges required';
  END IF;

  RETURN QUERY
  WITH latest AS (
    SELECT 
      p.id as proof_id,
      p.order_id as proof_order_id,
      p.status as proof_status,
      p.version as proof_version,
      p.created_at as proof_created_at,
      p.human_id as proof_human_id,
      p.human_year as proof_human_year,
      p.human_seq as proof_human_seq,
      o.order_number,
      o.human_id AS order_human_id,
      c.business_name,
      c.contact_name,
      ROW_NUMBER() OVER (PARTITION BY p.order_id ORDER BY p.version DESC) AS rn
    FROM public.proofs p
    JOIN public.orders o ON p.order_id = o.id
    JOIN public.submissions s ON o.submission_id = s.id
    JOIN public.clients c ON s.client_id = c.id
    WHERE p.archived_at IS NULL
      AND p.status != 'Approuvée'
  )
  SELECT 
    latest.proof_id as id,
    latest.proof_order_id as order_id,
    latest.proof_status as status,
    latest.proof_version as version,
    latest.proof_created_at as created_at,
    latest.proof_human_id as human_id,
    latest.proof_human_year as human_year,
    latest.proof_human_seq as human_seq,
    jsonb_build_object(
      'order_number', latest.order_number,
      'human_id', latest.order_human_id,
      'clients', jsonb_build_object(
        'business_name', latest.business_name,
        'contact_name', latest.contact_name
      )
    ) AS orders
  FROM latest
  WHERE latest.rn = 1
  ORDER BY latest.proof_human_year DESC NULLS LAST, latest.proof_human_seq DESC NULLS LAST, latest.proof_created_at DESC;
END;
$function$;