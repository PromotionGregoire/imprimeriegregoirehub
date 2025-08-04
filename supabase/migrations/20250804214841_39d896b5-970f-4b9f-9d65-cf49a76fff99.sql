-- Désactiver temporairement le trigger de log des épreuves
DROP TRIGGER IF EXISTS trigger_log_proof_upload ON proofs;

-- Créer l'épreuve manquante pour S-2025-0006
INSERT INTO proofs (order_id, version, status, approval_token, validation_token)
VALUES (
    'b91f49cf-0823-4796-bf86-c61e49c48519', 
    1, 
    'A preparer', 
    gen_random_uuid()::text, 
    gen_random_uuid()::text
);

-- Recréer le trigger
CREATE TRIGGER trigger_log_proof_upload
    AFTER INSERT ON proofs
    FOR EACH ROW
    EXECUTE FUNCTION log_proof_upload();