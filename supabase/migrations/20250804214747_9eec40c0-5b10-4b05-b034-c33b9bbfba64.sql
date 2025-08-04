-- Créer les épreuves manquantes pour les soumissions approuvées qui n'ont pas d'épreuve
INSERT INTO proofs (order_id, version, status, file_url, uploaded_by, approval_token, validation_token)
SELECT DISTINCT 
    o.id as order_id,
    1 as version,
    'A preparer' as status,
    null as file_url,
    null::uuid as uploaded_by,
    gen_random_uuid()::text as approval_token,
    gen_random_uuid()::text as validation_token
FROM orders o
JOIN submissions s ON o.submission_id = s.id
LEFT JOIN proofs p ON p.order_id = o.id
WHERE s.status = 'Acceptée'
  AND p.id IS NULL
  AND o.status = 'En attente de l''épreuve';

-- Ajouter un historique pour les épreuves créées rétroactivement
INSERT INTO ordre_historique (order_id, action_type, action_description, metadata, client_action, created_by)
SELECT DISTINCT
    o.id,
    'create_epreuve_retroactive',
    'Épreuve créée rétroactivement pour soumission approuvée ' || s.submission_number,
    jsonb_build_object(
        'submissionNumber', s.submission_number,
        'retroactiveCreation', true,
        'reason', 'Soumission approuvée avant automatisation',
        'timestamp', now()
    ),
    false,
    null::uuid
FROM orders o
JOIN submissions s ON o.submission_id = s.id
WHERE s.status = 'Acceptée'
  AND o.status = 'En attente de l''épreuve'
  AND NOT EXISTS (
      SELECT 1 FROM ordre_historique oh 
      WHERE oh.order_id = o.id 
      AND oh.action_type = 'create_epreuve_retroactive'
  );