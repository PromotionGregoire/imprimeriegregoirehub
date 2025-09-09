-- Relax access and filter by assigned user in get_latest_proofs_by_order
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
  -- Require authentication only; authorization enforced by explicit filter below
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  WITH latest AS (
    SELECT 
      p.id                AS proof_id,
      p.order_id          AS proof_order_id,
      p.status            AS proof_status,
      p.version           AS proof_version,
      p.created_at        AS proof_created_at,
      p.human_id          AS proof_human_id,
      p.human_year        AS proof_human_year,
      p.human_seq         AS proof_human_seq,
      o.order_number,
      o.human_id          AS order_human_id,
      c.business_name,
      c.contact_name,
      c.assigned_user_id,
      ROW_NUMBER() OVER (
        PARTITION BY p.order_id 
        ORDER BY p.version DESC, p.created_at DESC, p.id DESC
      ) AS rn
    FROM public.proofs p
    JOIN public.orders o       ON o.id = p.order_id
    JOIN public.submissions s  ON s.id = o.submission_id
    JOIN public.clients c      ON c.id = s.client_id
    WHERE p.archived_at IS NULL
      AND COALESCE(p.is_archived, false) = false
      AND p.status <> 'Approuvée'
      AND (c.assigned_user_id = auth.uid() OR is_admin_or_manager())
  )
  SELECT 
    latest.proof_id        AS id,
    latest.proof_order_id  AS order_id,
    latest.proof_status    AS status,
    latest.proof_version   AS version,
    latest.proof_created_at AS created_at,
    latest.proof_human_id  AS human_id,
    latest.proof_human_year AS human_year,
    latest.proof_human_seq AS human_seq,
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
  ORDER BY latest.proof_human_year DESC NULLS LAST,
           latest.proof_human_seq DESC NULLS LAST,
           latest.proof_created_at DESC;
END;
$function$;