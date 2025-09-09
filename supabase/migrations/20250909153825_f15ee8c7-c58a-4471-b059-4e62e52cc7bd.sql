-- Recreate function to return latest proof per order sorted by sequential human code
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
      p.id,
      p.order_id,
      p.status,
      p.version,
      p.created_at,
      p.human_id,
      p.human_year,
      p.human_seq,
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
    id,
    order_id,
    status,
    version,
    created_at,
    human_id,
    human_year,
    human_seq,
    jsonb_build_object(
      'order_number', order_number,
      'human_id', order_human_id,
      'clients', jsonb_build_object(
        'business_name', business_name,
        'contact_name', contact_name
      )
    ) AS orders
  FROM latest
  WHERE rn = 1
  ORDER BY human_year DESC NULLS LAST, human_seq DESC NULLS LAST, created_at DESC;
END;
$function$