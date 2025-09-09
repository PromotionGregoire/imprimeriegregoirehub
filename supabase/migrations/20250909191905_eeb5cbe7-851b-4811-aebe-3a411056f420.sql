-- Fix failed previous migration error by making human_id not unique and generate proper human code only when missing
-- SAFETY: Only drop unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'u' AND t.relname = 'proofs' AND n.nspname = 'public' AND c.conname = 'proofs_human_id_key'
  ) THEN
    ALTER TABLE public.proofs DROP CONSTRAINT proofs_human_id_key;
  END IF;
END $$;

-- Create or replace generator that builds E-YYYY-#### when needed
CREATE OR REPLACE FUNCTION public.set_proof_human_fields()
RETURNS TRIGGER AS $$
DECLARE
  v_year INTEGER := COALESCE(EXTRACT(YEAR FROM NEW.created_at)::int, EXTRACT(YEAR FROM now())::int);
  v_seq INTEGER;
BEGIN
  IF NEW.human_year IS NULL THEN NEW.human_year := v_year; END IF;
  IF NEW.human_seq IS NULL THEN
    SELECT COALESCE(MAX(human_seq) + 1, 1) INTO v_seq FROM public.proofs WHERE human_year = NEW.human_year;
    NEW.human_seq := v_seq;
  END IF;
  IF NEW.human_id IS NULL OR NEW.human_id = '' THEN
    NEW.human_id := 'E';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_proof_human_fields ON public.proofs;
CREATE TRIGGER trg_set_proof_human_fields
BEFORE INSERT ON public.proofs
FOR EACH ROW
EXECUTE FUNCTION public.set_proof_human_fields();

-- Backfill missing values safely
WITH by_year AS (
  SELECT id, EXTRACT(YEAR FROM created_at)::int AS y
  FROM public.proofs
)
UPDATE public.proofs p
SET human_year = COALESCE(p.human_year, by_year.y),
    human_seq = COALESCE(p.human_seq, (
      SELECT COALESCE(MAX(human_seq), 0) + 1 FROM public.proofs p2 WHERE p2.human_year = by_year.y
    )),
    human_id = COALESCE(NULLIF(p.human_id,''), 'E')
FROM by_year
WHERE p.id = by_year.id AND (p.human_year IS NULL OR p.human_seq IS NULL OR p.human_id IS NULL OR p.human_id = '');