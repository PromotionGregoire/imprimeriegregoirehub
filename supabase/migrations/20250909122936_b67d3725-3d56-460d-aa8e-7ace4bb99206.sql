-- Ajouter la colonne proof_code à la table proofs
ALTER TABLE proofs
ADD COLUMN IF NOT EXISTS proof_code text;

-- Fonction pour générer automatiquement le proof_code
CREATE OR REPLACE FUNCTION set_proof_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
  v_base text;
BEGIN
  IF NEW.proof_code IS NULL OR NEW.proof_code = '' THEN
    SELECT order_number INTO v_order_number FROM orders WHERE id = NEW.order_id;
    IF v_order_number IS NOT NULL THEN
      -- remplace le préfixe lettre par 'E-'
      v_base := 'E-' || regexp_replace(v_order_number, '^[A-Z]-', '');
      IF NEW.version IS NOT NULL THEN
        NEW.proof_code := v_base || '-v' || lpad(NEW.version::text, 2, '0');
      ELSE
        NEW.proof_code := v_base || '-v01';
        NEW.version := COALESCE(NEW.version, 1);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Créer le trigger pour générer automatiquement proof_code
DROP TRIGGER IF EXISTS trg_set_proof_code ON proofs;
CREATE TRIGGER trg_set_proof_code
BEFORE INSERT OR UPDATE ON proofs
FOR EACH ROW
EXECUTE FUNCTION set_proof_code();

-- Backfill pour les épreuves existantes sans code
UPDATE proofs p
SET proof_code = 'E-' || regexp_replace(o.order_number, '^[A-Z]-', '') || '-v' || lpad(p.version::text, 2, '0')
FROM orders o
WHERE p.order_id = o.id AND (p.proof_code IS NULL OR p.proof_code = '');