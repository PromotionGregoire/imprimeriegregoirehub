-- Créer une nouvelle fonction pour obtenir TOUTES les épreuves (toutes versions)
CREATE OR REPLACE FUNCTION public.get_all_proofs()
RETURNS TABLE(
    id uuid,
    order_id uuid,
    status text,
    version integer,
    created_at timestamptz,
    human_id text,
    human_year integer,
    human_seq integer,
    archived_at timestamptz,
    is_archived boolean,
    archive_reason text,
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
  SELECT 
    p.id,
    p.order_id,
    p.status,
    p.version,
    p.created_at,
    p.human_id,
    p.human_year,
    p.human_seq,
    p.archived_at,
    p.is_archived,
    p.archive_reason,
    jsonb_build_object(
      'order_number', o.order_number,
      'human_id', o.human_id,
      'clients', jsonb_build_object(
        'business_name', c.business_name,
        'contact_name', c.contact_name
      )
    ) AS orders
  FROM public.proofs p
  JOIN public.orders o       ON o.id = p.order_id
  JOIN public.submissions s  ON s.id = o.submission_id
  JOIN public.clients c      ON c.id = s.client_id
  WHERE (c.assigned_user_id = auth.uid() OR is_admin_or_manager())
  ORDER BY p.human_year DESC NULLS LAST,
           p.human_seq DESC NULLS LAST,
           p.created_at DESC;
END;
$function$;