-- Fusionner V9 et V10 : transférer commentaires et archiver V10
DO $$
DECLARE
    v9_id uuid;
    v10_id uuid;
    order_uuid uuid := '6fd7ea39-7524-4398-b611-ebc4bb17b1da';
BEGIN
    -- Récupérer les IDs des versions 9 et 10
    SELECT id INTO v9_id FROM proofs WHERE order_id = order_uuid AND version = 9;
    SELECT id INTO v10_id FROM proofs WHERE order_id = order_uuid AND version = 10;
    
    -- Vérifier que les deux versions existent
    IF v9_id IS NULL OR v10_id IS NULL THEN
        RAISE EXCEPTION 'Versions 9 ou 10 introuvables pour la commande %', order_uuid;
    END IF;
    
    -- Transférer tous les commentaires de V10 vers V9
    UPDATE epreuve_commentaires 
    SET proof_id = v9_id
    WHERE proof_id = v10_id;
    
    -- Archiver V10
    UPDATE proofs 
    SET 
        archived_at = now(),
        is_archived = true,
        archive_reason = 'Version fusionnée avec V9 - V9 reste la version approuvée',
        updated_at = now()
    WHERE id = v10_id;
    
    -- S'assurer que V9 est bien la version active et approuvée
    UPDATE proofs 
    SET 
        is_active = true,
        updated_at = now()
    WHERE id = v9_id;
    
    -- Logger l'action dans l'historique
    PERFORM add_ordre_history(
        p_order_id := order_uuid,
        p_action_type := 'merge_proof_versions',
        p_action_description := 'Fusion V10 vers V9 : commentaires transférés, V10 archivée, V9 reste approuvée',
        p_metadata := jsonb_build_object(
            'mergedFrom', 10,
            'mergedTo', 9,
            'action', 'transfer_comments_and_archive'
        ),
        p_proof_id := v9_id,
        p_client_action := false
    );
    
    RAISE NOTICE 'Fusion terminée : commentaires transférés de V10 vers V9, V10 archivée';
END $$;