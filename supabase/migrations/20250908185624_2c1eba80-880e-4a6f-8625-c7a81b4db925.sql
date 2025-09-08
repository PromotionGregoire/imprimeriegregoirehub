-- ======================================================
-- AUTO-CRÉATION COMMANDE & ÉPREUVE À L'APPROBATION  
-- Nettoyage avec CASCADE puis nouvelle implémentation
-- ======================================================

-- Extensions utiles (déjà présentes, sans danger si rejouées)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Nettoyage complet avec CASCADE pour supprimer les dépendances
DROP TRIGGER IF EXISTS create_order_on_approval ON public.submissions;
DROP FUNCTION IF EXISTS public.create_order_from_submission() CASCADE;

-- Nettoyer les anciens triggers/fonctions avec CASCADE
DROP TRIGGER IF EXISTS create_initial_proof_after_order ON public.orders;
DROP TRIGGER IF EXISTS trg_create_initial_proof_after_order ON public.orders;
DROP FUNCTION IF EXISTS public.create_initial_proof_after_order() CASCADE;

-- 1) À l'approbation d'une soumission -> créer la commande (si absente)
CREATE OR REPLACE FUNCTION public.create_order_after_submission_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  -- On ne déclenche que lors du passage à "Approuvée"
  IF NEW.status = 'Approuvée' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Existe-t-il déjà une commande pour cette soumission ?
    SELECT o.id INTO v_order_id
    FROM public.orders o
    WHERE o.submission_id = NEW.id
    LIMIT 1;

    IF v_order_id IS NULL THEN
      INSERT INTO public.orders (submission_id, client_id, total_price, status)
      VALUES (NEW.id, NEW.client_id, COALESCE(NEW.total_price, 0), 'En attente de l''épreuve')
      RETURNING id INTO v_order_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_order_after_submission_approval ON public.submissions;
CREATE TRIGGER trg_create_order_after_submission_approval
AFTER UPDATE OF status ON public.submissions
FOR EACH ROW
WHEN (NEW.status = 'Approuvée' AND NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION public.create_order_after_submission_approval();

-- 2) À la création d'une commande -> s'assurer d'avoir une épreuve v1
CREATE OR REPLACE FUNCTION public.ensure_initial_proof_after_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cnt int;
  v_version int := 1;
  v_approval_token text := encode(gen_random_bytes(16), 'hex');
  v_validation_token text := encode(gen_random_bytes(16), 'hex');
BEGIN
  SELECT COUNT(*) INTO v_cnt FROM public.proofs WHERE order_id = NEW.id;
  IF v_cnt = 0 THEN
    -- Si la fonction existe, on récupère la prochaine version
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
      'En préparation',   -- 👈 statut en FR pour coller à l'UI
      TRUE,
      v_approval_token,
      v_validation_token,
      now(),
      now()
    );

    -- Historique (facultatif). On tente, et on ignore si une contrainte bloque.
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

DROP TRIGGER IF EXISTS trg_ensure_initial_proof_after_order ON public.orders;
CREATE TRIGGER trg_ensure_initial_proof_after_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.ensure_initial_proof_after_order();

-- 3) (Recommandé) 1 commande par soumission
--    Évite toute duplication si une edge function fait aussi un insert.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname='public' AND indexname='orders_submission_unique'
  ) THEN
    CREATE UNIQUE INDEX orders_submission_unique
      ON public.orders(submission_id);
  END IF;
END$$;