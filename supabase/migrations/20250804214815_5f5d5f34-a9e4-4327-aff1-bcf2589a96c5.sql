-- Créer uniquement l'épreuve manquante pour S-2025-0006
INSERT INTO proofs (order_id, version, status, approval_token, validation_token)
VALUES (
    'b91f49cf-0823-4796-bf86-c61e49c48519', 
    1, 
    'A preparer', 
    gen_random_uuid()::text, 
    gen_random_uuid()::text
);