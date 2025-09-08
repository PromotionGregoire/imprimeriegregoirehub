-- Fix triggers to use pgcrypto from extensions schema and proper search_path
-- Ensure extension exists in extensions schema
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Replace ensure_initial_proof_after_order to use extensions.gen_random_bytes and search_path
CREATE OR REPLACE FUNCTION public.ensure_initial_proof_after_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_cnt int;
  v_version int := 1;
  v_approval_token text := encode(extensions.gen_random_bytes(16), 'hex');
  v_validation_token text := encode(extensions.gen_random_bytes(16), 'hex');
BEGIN
  SELECT COUNT(*) INTO v_cnt FROM public.proofs WHERE order_id = NEW.id;
  IF v_cnt = 0 THEN
    -- Try to get next version if helper exists
    BEGIN
      SELECT public.get_next_proof_version(NEW.id) INTO v_version;
    EXCEPTION WHEN undefined_function THEN
      v_version := 1;
    END;

    INSERT INTO public.proofs (
      order_id, version, status, is_active, approval_token, validation_token,
      created_at, updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(v_version, 1),
      'En préparation',
      TRUE,
      v_approval_token,
      v_validation_token,
      now(),
      now()
    );

    -- Best-effort history log
    BEGIN
      PERFORM public.add_ordre_history(
        p_action_description => 'Épreuve v' || COALESCE(v_version,1) || ' créée automatiquement',
        p_action_type        => 'create_proof',
        p_order_id           => NEW.id
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Also ensure create_order_after_submission_approval has a safe search_path
CREATE OR REPLACE FUNCTION public.create_order_after_submission_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  IF NEW.status = 'Approuvée' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
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