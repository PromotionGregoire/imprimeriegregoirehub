-- Fusionner V9 et V10 : transférer commentaires et archiver V10
DO $$
DECLARE
    v9_id uuid := '369d6459-73ca-4384-81e6-a97a065cda9d';
    v10_id uuid := '9b44e217-10e7-4c9a-a027-feb81c8f6240';
    order_uuid uuid := 'd3843bba-775b-4b7b-beaa-28442c238c04';
BEGIN
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
    
    -- Logger l'action dans l'historique avec un action_type valide
    PERFORM add_ordre_history(
        p_order_id := order_uuid,
        p_action_type := 'update_order',
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