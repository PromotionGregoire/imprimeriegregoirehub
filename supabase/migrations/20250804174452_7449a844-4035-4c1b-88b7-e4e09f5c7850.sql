-- Migration: Création automatique d'une épreuve lors de l'acceptation d'une soumission

-- 1. D'abord, corriger le statut des épreuves existantes
UPDATE public.proofs 
SET status = 'À préparer' 
WHERE status = 'A preparer';

-- 2. Fonction pour créer automatiquement une épreuve initiale
CREATE OR REPLACE FUNCTION public.create_initial_proof_for_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_proof_id UUID;
    v_approval_token TEXT;
    v_validation_token TEXT;
BEGIN
    -- Générer les tokens
    v_approval_token := gen_random_uuid()::text;
    v_validation_token := gen_random_uuid()::text;
    
    -- Créer automatiquement une épreuve initiale pour la nouvelle commande
    INSERT INTO public.proofs (
        id,
        order_id,
        version,
        status,
        approval_token,
        validation_token,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        NEW.id,
        1,
        'À préparer',
        v_approval_token,
        v_validation_token,
        true,
        NOW(),
        NOW()
    ) RETURNING id INTO v_proof_id;
    
    -- Logger l'action dans l'historique avec le bon action_type
    PERFORM add_ordre_history(
        p_order_id := NEW.id,
        p_action_type := 'upload_epreuve',
        p_action_description := 'Épreuve initiale créée automatiquement pour la commande ' || NEW.order_number,
        p_metadata := jsonb_build_object(
            'proof_id', v_proof_id,
            'version', 1,
            'status', 'À préparer',
            'auto_created', true
        ),
        p_proof_id := v_proof_id,
        p_client_action := false
    );
    
    RETURN NEW;
END;
$$;

-- 3. Créer le trigger AFTER INSERT sur la table orders
DROP TRIGGER IF EXISTS trigger_create_initial_proof ON public.orders;
CREATE TRIGGER trigger_create_initial_proof
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.create_initial_proof_for_order();

-- 4. Corriger les commandes existantes qui n'ont pas d'épreuve
DO $$
DECLARE
    v_order RECORD;
    v_proof_exists BOOLEAN;
    v_proof_id UUID;
BEGIN
    -- Pour chaque commande existante
    FOR v_order IN 
        SELECT id, order_number 
        FROM public.orders 
        WHERE status IN ('En attente de l''épreuve', 'En production')
        ORDER BY created_at DESC
    LOOP
        -- Vérifier si une épreuve existe déjà
        SELECT EXISTS(
            SELECT 1 FROM public.proofs 
            WHERE order_id = v_order.id
        ) INTO v_proof_exists;
        
        -- Si aucune épreuve n'existe, en créer une
        IF NOT v_proof_exists THEN
            INSERT INTO public.proofs (
                order_id,
                version,
                status,
                approval_token,
                validation_token,
                is_active
            ) VALUES (
                v_order.id,
                1,
                'À préparer',
                gen_random_uuid()::text,
                gen_random_uuid()::text,
                true
            ) RETURNING id INTO v_proof_id;
            
            -- Logger l'action avec le bon action_type
            PERFORM add_ordre_history(
                p_order_id := v_order.id,
                p_action_type := 'upload_epreuve',
                p_action_description := 'Épreuve initiale créée rétroactivement pour la commande ' || v_order.order_number,
                p_metadata := jsonb_build_object(
                    'proof_id', v_proof_id,
                    'version', 1,
                    'status', 'À préparer',
                    'retroactive_creation', true
                ),
                p_proof_id := v_proof_id,
                p_client_action := false
            );
            
            RAISE NOTICE 'Épreuve créée pour la commande %', v_order.order_number;
        END IF;
    END LOOP;
END $$;

-- 5. Ajouter une contrainte pour assurer la cohérence des statuts
ALTER TABLE public.proofs 
DROP CONSTRAINT IF EXISTS check_proof_status;

ALTER TABLE public.proofs 
ADD CONSTRAINT check_proof_status CHECK (status IN (
    'À préparer',
    'En préparation', 
    'Envoyée au client',
    'Modification demandée',
    'Approuvée'
));