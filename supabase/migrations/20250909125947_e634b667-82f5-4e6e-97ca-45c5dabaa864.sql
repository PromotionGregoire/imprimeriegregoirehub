-- ENLEVER LA CONTRAINTE POUR L'INSTANT ET CONTINUER AVEC LE RESTE
ALTER TABLE ordre_historique
DROP CONSTRAINT IF EXISTS check_action_type;

-- CRÉER LES AUTRES PARTIES DE L'INFRASTRUCTURE

-- 1) INDEXES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_is_archived ON submissions(is_archived) WHERE is_archived = TRUE;
CREATE INDEX IF NOT EXISTS idx_submissions_client_id ON submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_is_archived ON orders(is_archived) WHERE is_archived = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_submission_id ON orders(submission_id);

CREATE INDEX IF NOT EXISTS idx_proofs_status ON proofs(status);
CREATE INDEX IF NOT EXISTS idx_proofs_is_archived ON proofs(is_archived) WHERE is_archived = TRUE;
CREATE INDEX IF NOT EXISTS idx_proofs_order_id_version ON proofs(order_id, version);
CREATE UNIQUE INDEX IF NOT EXISTS idx_proofs_proof_code_unique ON proofs(proof_code) WHERE proof_code IS NOT NULL;

-- 2) VUES POUR FILTRAGES ARCHIVAGE
CREATE OR REPLACE VIEW v_active_submissions AS
SELECT * FROM submissions WHERE is_archived = FALSE;

CREATE OR REPLACE VIEW v_archived_submissions AS  
SELECT * FROM submissions WHERE is_archived = TRUE;

CREATE OR REPLACE VIEW v_active_orders AS
SELECT * FROM orders WHERE is_archived = FALSE;

CREATE OR REPLACE VIEW v_archived_orders AS
SELECT * FROM orders WHERE is_archived = TRUE;

CREATE OR REPLACE VIEW v_active_proofs AS
SELECT * FROM proofs WHERE is_archived = FALSE;

CREATE OR REPLACE VIEW v_archived_proofs AS
SELECT * FROM proofs WHERE is_archived = TRUE;

-- 3) BACKFILL PROOF_CODE POUR LES ÉPREUVES EXISTANTES
UPDATE proofs 
SET proof_code = 'E-' || regexp_replace(o.order_number, '^[A-Z]-', '') || '-v' || lpad(proofs.version::text, 2, '0')
FROM orders o 
WHERE proofs.order_id = o.id 
  AND (proofs.proof_code IS NULL OR proofs.proof_code = '')
  AND o.order_number IS NOT NULL;