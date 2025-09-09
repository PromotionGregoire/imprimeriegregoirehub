-- Fix proof display by adding human readable identifiers
-- Create trigger to generate human_id, human_year, human_seq for proofs

CREATE OR REPLACE FUNCTION public.set_proof_human_id()
RETURNS TRIGGER AS $$
DECLARE
  v_year INTEGER;
  v_seq INTEGER;
BEGIN
  -- Only set if not already set
  IF NEW.human_id IS NULL OR NEW.human_year IS NULL OR NEW.human_seq IS NULL THEN
    v_year := EXTRACT(YEAR FROM NEW.created_at);
    
    -- Get next sequence number for this year
    v_seq := COALESCE(
      (SELECT MAX(human_seq) + 1 
       FROM public.proofs 
       WHERE human_year = v_year),
      1
    );
    
    -- Set the human readable fields
    NEW.human_year := v_year;
    NEW.human_seq := v_seq;
    NEW.human_id := 'E';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_proof_human_id ON public.proofs;
CREATE TRIGGER trigger_set_proof_human_id
  BEFORE INSERT OR UPDATE ON public.proofs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_proof_human_id();

-- Update existing proofs that don't have human readable IDs
UPDATE public.proofs 
SET 
  human_year = EXTRACT(YEAR FROM created_at),
  human_seq = (
    SELECT ROW_NUMBER() OVER (ORDER BY created_at, id) 
    FROM public.proofs p2 
    WHERE p2.id = proofs.id 
    AND EXTRACT(YEAR FROM p2.created_at) = EXTRACT(YEAR FROM proofs.created_at)
  ),
  human_id = 'E'
WHERE human_id IS NULL OR human_year IS NULL OR human_seq IS NULL;