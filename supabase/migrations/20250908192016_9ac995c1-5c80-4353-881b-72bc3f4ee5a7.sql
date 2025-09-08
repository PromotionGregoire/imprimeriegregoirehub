-- Ensure pgcrypto available under extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1) Harden function: accept multiple approval status variants (approuvée/acceptée/approved)
CREATE OR REPLACE FUNCTION public.create_order_after_submission_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_order_id uuid;
  v_status_lower text;
BEGIN
  v_status_lower := lower(coalesce(NEW.status, ''));
  -- Fire when status transitions to any approved/accepted variant
  IF v_status_lower IN ('approuvée','approuvee','acceptée','acceptee','approved','accepted')
     AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Check if order already exists
    SELECT o.id INTO v_order_id
    FROM public.orders o
    WHERE o.submission_id = NEW.id
    LIMIT 1;

    IF v_order_id IS NULL THEN
      INSERT INTO public.orders (submission_id, client_id, total_price, status)
      VALUES (NEW.id, NEW.client_id, COALESCE(NEW.total_price, 0), 'En attente de l''épreuve');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Recreate triggers (idempotent):
-- Drop if exist to avoid duplicates
DROP TRIGGER IF EXISTS trg_create_order_after_submission_approval ON public.submissions;
CREATE TRIGGER trg_create_order_after_submission_approval
AFTER UPDATE OF status ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.create_order_after_submission_approval();

DROP TRIGGER IF EXISTS trg_ensure_initial_proof_after_order ON public.orders;
CREATE TRIGGER trg_ensure_initial_proof_after_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.ensure_initial_proof_after_order();

-- 3) Backfill: create missing orders for already approved submissions
WITH approved AS (
  SELECT s.id, s.client_id, COALESCE(s.total_price, 0) AS total_price
  FROM public.submissions s
  LEFT JOIN public.orders o ON o.submission_id = s.id
  WHERE o.id IS NULL AND lower(coalesce(s.status,'')) IN ('approuvée','approuvee','acceptée','acceptee','approved','accepted')
)
INSERT INTO public.orders (submission_id, client_id, total_price, status)
SELECT id, client_id, total_price, 'En attente de l''épreuve'
FROM approved;

-- 4) Backfill: create missing initial proofs for orders without any proof
WITH no_proof AS (
  SELECT o.id AS order_id
  FROM public.orders o
  LEFT JOIN public.proofs p ON p.order_id = o.id
  WHERE p.id IS NULL
)
INSERT INTO public.proofs (
  order_id, version, status, is_active, approval_token, validation_token, created_at, updated_at
)
SELECT 
  np.order_id,
  1,
  'En préparation',
  TRUE,
  encode(extensions.gen_random_bytes(16), 'hex'),
  encode(extensions.gen_random_bytes(16), 'hex'),
  now(),
  now()
FROM no_proof np;

-- 5) Safety: unique index on orders(submission_id)
CREATE UNIQUE INDEX IF NOT EXISTS orders_submission_unique ON public.orders(submission_id);
