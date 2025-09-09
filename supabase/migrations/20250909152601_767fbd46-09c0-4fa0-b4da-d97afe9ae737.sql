-- Migration: Ajout des identifiants humains pour commandes et épreuves

-- COMMANDES : Ajouter colonnes pour identifiants humains
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS human_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS human_year int,
  ADD COLUMN IF NOT EXISTS human_seq int;

-- Index pour tri par défaut (plus récent au plus vieux)
CREATE INDEX IF NOT EXISTS idx_orders_human_sort
  ON orders (human_year DESC, human_seq DESC);

-- ÉPREUVES : Ajouter colonnes pour identifiants humains  
ALTER TABLE proofs
  ADD COLUMN IF NOT EXISTS human_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS human_year int,
  ADD COLUMN IF NOT EXISTS human_seq int;

-- Index pour tri par défaut (plus récent au plus vieux)
CREATE INDEX IF NOT EXISTS idx_proofs_human_sort
  ON proofs (human_year DESC, human_seq DESC);

-- Table de séquences atomiques par type+année
CREATE TABLE IF NOT EXISTS id_sequences (
  kind text NOT NULL,  -- 'order' | 'proof'
  year int NOT NULL,
  next_seq int NOT NULL DEFAULT 1,
  PRIMARY KEY (kind, year)
);

-- Fonction RPC atomique pour réserver les séquences
CREATE OR REPLACE FUNCTION reserve_sequence(p_kind text, p_year int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE 
  v_next int;
BEGIN
  LOOP
    -- Insérer la séquence pour cette année si elle n'existe pas
    INSERT INTO id_sequences(kind, year, next_seq) 
    VALUES (p_kind, p_year, 1)
    ON CONFLICT (kind, year) DO NOTHING;

    -- Récupérer et incrémenter la séquence
    UPDATE id_sequences
    SET next_seq = next_seq + 1
    WHERE kind = p_kind AND year = p_year
    RETURNING next_seq - 1 INTO v_next;

    IF FOUND THEN
      RETURN v_next;
    END IF;
    
    -- Si pas trouvé, réessayer (gestion concurrence)
  END LOOP;
END $$;

-- Backfill des commandes existantes
WITH ranked AS (
  SELECT id,
         EXTRACT(YEAR FROM created_at)::int AS y,
         ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM created_at) ORDER BY created_at, id) AS seq
  FROM orders
  WHERE human_id IS NULL
)
UPDATE orders o
SET human_year = r.y,
    human_seq = r.seq,
    human_id = format('C-%s-%s', r.y, lpad(r.seq::text, 4, '0'))
FROM ranked r
WHERE o.id = r.id;

-- Backfill des épreuves existantes
WITH ranked AS (
  SELECT id,
         EXTRACT(YEAR FROM created_at)::int AS y,
         ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM created_at) ORDER BY created_at, id) AS seq
  FROM proofs
  WHERE human_id IS NULL
)
UPDATE proofs p
SET human_year = r.y,
    human_seq = r.seq,
    human_id = format('E-%s-%s', r.y, lpad(r.seq::text, 4, '0'))
FROM ranked r
WHERE p.id = r.id;

-- Mettre à jour les séquences pour les nouveaux enregistrements
INSERT INTO id_sequences (kind, year, next_seq)
SELECT 'order', human_year, MAX(human_seq) + 1
FROM orders
WHERE human_id IS NOT NULL
GROUP BY human_year
ON CONFLICT (kind, year) DO UPDATE SET next_seq = GREATEST(id_sequences.next_seq, EXCLUDED.next_seq);

INSERT INTO id_sequences (kind, year, next_seq)
SELECT 'proof', human_year, MAX(human_seq) + 1
FROM proofs
WHERE human_id IS NOT NULL
GROUP BY human_year
ON CONFLICT (kind, year) DO UPDATE SET next_seq = GREATEST(id_sequences.next_seq, EXCLUDED.next_seq);