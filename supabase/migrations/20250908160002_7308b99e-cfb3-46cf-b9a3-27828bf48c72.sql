-- Fix SECURITY DEFINER functions by adding proper security checks where needed
-- and removing SECURITY DEFINER where it's not necessary

-- 1. Remove SECURITY DEFINER from test function (not needed in production)
CREATE OR REPLACE FUNCTION public.test_history_triggers()
RETURNS TABLE(test_name text, test_result boolean, test_message text)
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
    v_test_order_id UUID;
    v_test_proof_id UUID;
    v_test_client_id UUID;
    v_test_submission_id UUID;
    v_history_count INTEGER;
    v_initial_count INTEGER;
BEGIN
    -- Only allow admins to run this test function
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Compter les entrées initiales
    SELECT COUNT(*) INTO v_initial_count FROM public.ordre_historique;

    -- Récupérer ou créer un client de test
    SELECT id INTO v_test_client_id FROM public.clients LIMIT 1;
    
    IF v_test_client_id IS NULL THEN
        INSERT INTO public.clients (business_name, contact_name, email, phone_number)
        VALUES ('Test Company', 'Test Contact', 'test@example.com', '1234567890')
        RETURNING id INTO v_test_client_id;
    END IF;

    -- Créer une soumission de test
    INSERT INTO public.submissions (client_id, status)
    VALUES (v_test_client_id, 'Brouillon')
    RETURNING id INTO v_test_submission_id;

    -- Créer une commande de test
    INSERT INTO public.orders (client_id, submission_id, total_price, status)
    VALUES (
        v_test_client_id,
        v_test_submission_id,
        100.00,
        'En attente de l''épreuve'
    ) RETURNING id INTO v_test_order_id;

    -- Test 1: Upload d'épreuve
    INSERT INTO public.proofs (
        order_id,
        file_url,
        version,
        status,
        uploaded_by
    ) VALUES (
        v_test_order_id,
        'https://example.com/test-trigger-proof.pdf',
        1,
        'A preparer',
        auth.uid()
    ) RETURNING id INTO v_test_proof_id;

    -- Vérifier l'historique
    SELECT COUNT(*) INTO v_history_count
    FROM public.ordre_historique
    WHERE order_id = v_test_order_id
    AND action_type = 'upload_proof';

    RETURN QUERY
    SELECT 
        'Upload trigger test'::TEXT,
        v_history_count >= 1,
        'Upload logged: ' || v_history_count || ' entries';

    -- Test 2: Changement de statut
    UPDATE public.proofs 
    SET status = 'Approuvée'
    WHERE id = v_test_proof_id;

    SELECT COUNT(*) INTO v_history_count
    FROM public.ordre_historique
    WHERE order_id = v_test_order_id
    AND action_type = 'approve_epreuve';

    RETURN QUERY
    SELECT 
        'Status change trigger test'::TEXT,
        v_history_count >= 1,
        'Status change logged: ' || v_history_count || ' entries';

    -- Nettoyer
    DELETE FROM public.orders WHERE id = v_test_order_id;
    DELETE FROM public.submissions WHERE id = v_test_submission_id;

    RETURN QUERY
    SELECT 
        'Overall test'::TEXT,
        true,
        'Tests completed successfully. Initial entries: ' || v_initial_count;
END;
$function$;

-- 2. Add input validation to get_latest_proofs_by_order function
CREATE OR REPLACE FUNCTION public.get_latest_proofs_by_order()
RETURNS TABLE(id uuid, order_id uuid, status text, version integer, created_at timestamp with time zone, orders jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Only allow authenticated users with proper roles
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    IF NOT is_admin_or_manager() THEN
        RAISE EXCEPTION 'Access denied: Admin or Manager privileges required';
    END IF;

    RETURN QUERY
    SELECT DISTINCT ON (p.order_id)
        p.id,
        p.order_id,
        p.status,
        p.version,
        p.created_at,
        jsonb_build_object(
            'order_number', o.order_number,
            'clients', jsonb_build_object(
                'business_name', c.business_name,
                'contact_name', c.contact_name
            )
        ) as orders
    FROM public.proofs p
    JOIN public.orders o ON p.order_id = o.id
    JOIN public.submissions s ON o.submission_id = s.id
    JOIN public.clients c ON s.client_id = c.id
    WHERE p.status != 'Approuvée'
    ORDER BY p.order_id, p.version DESC;
END;
$function$;

-- 3. Add input validation to gen_invoice_number function
CREATE OR REPLACE FUNCTION public.gen_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE y TEXT := to_char(now(),'YYYY');
BEGIN
    -- Only allow authenticated users with proper roles
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    IF NOT is_admin_or_manager() THEN
        RAISE EXCEPTION 'Access denied: Admin or Manager privileges required';
    END IF;

    RETURN 'FAC-'||y||'-'||lpad(nextval('seq_invoice_no')::TEXT,4,'0');
END; 
$function$;

-- 4. Add proper validation to mark_invoices_overdue function
CREATE OR REPLACE FUNCTION public.mark_invoices_overdue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Only allow system or admin users to run this function
    IF auth.uid() IS NOT NULL AND NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    UPDATE invoices
    SET status = 'overdue', updated_at = now()
    WHERE status IN ('sent','partial')
      AND due_at IS NOT NULL
      AND due_at < now()
      AND balance_due > 0;
END
$function$;

-- 5. Add validation to public-facing approval functions
CREATE OR REPLACE FUNCTION public.get_submission_for_approval(p_token text, p_token_type text DEFAULT 'approval'::text)
RETURNS TABLE(id uuid, submission_number text, client_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, sent_at timestamp with time zone, deadline timestamp with time zone, valid_until timestamp with time zone, status text, approved_by text, modification_request_notes text, business_name text, contact_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Validate token format and existence
    IF p_token IS NULL OR p_token = '' OR LENGTH(p_token) < 10 THEN
        RAISE EXCEPTION 'Invalid token format';
    END IF;
    
    -- Validate token type
    IF p_token_type NOT IN ('approval', 'acceptance') THEN
        RAISE EXCEPTION 'Invalid token type';
    END IF;

    RETURN QUERY
    SELECT 
        s.id,
        s.submission_number,
        s.client_id,
        s.created_at,
        s.updated_at,
        s.sent_at,
        s.deadline,
        s.valid_until,
        s.status,
        s.approved_by,
        s.modification_request_notes,
        c.business_name,
        c.contact_name
        -- Explicitly exclude s.total_price (sensitive financial data)
    FROM public.submissions s
    JOIN public.clients c ON s.client_id = c.id
    WHERE (
        (p_token_type = 'approval' AND s.approval_token = p_token) OR
        (p_token_type = 'acceptance' AND s.acceptance_token = p_token)
    )
    AND s.valid_until > NOW()
    AND p_token IS NOT NULL 
    AND p_token != '';
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_proof_for_approval(p_approval_token text)
RETURNS TABLE(id uuid, order_id uuid, version integer, status text, created_at timestamp with time zone, updated_at timestamp with time zone, approved_at timestamp with time zone, client_comments text, approved_by_name text, order_number text, business_name text, contact_name text, submission_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Validate token format and existence
    IF p_approval_token IS NULL OR p_approval_token = '' OR LENGTH(p_approval_token) < 10 THEN
        RAISE EXCEPTION 'Invalid approval token format';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.order_id,
        p.version,
        p.status,
        p.created_at,
        p.updated_at,
        p.approved_at,
        p.client_comments,
        p.approved_by_name,
        o.order_number,
        c.business_name,
        c.contact_name,
        s.submission_number
        -- Explicitly exclude sensitive data:
        -- p.file_url (business-critical file access)
        -- p.approval_token (token manipulation risk)  
        -- p.validation_token (internal token exposure)
        -- p.uploaded_by (internal user information)
    FROM public.proofs p
    JOIN public.orders o ON p.order_id = o.id
    JOIN public.submissions s ON o.submission_id = s.id  
    JOIN public.clients c ON s.client_id = c.id
    WHERE p.approval_token = p_approval_token
    AND p.is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_proof_file_url(p_approval_token text)
RETURNS TABLE(file_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Validate token format and existence
    IF p_approval_token IS NULL OR p_approval_token = '' OR LENGTH(p_approval_token) < 10 THEN
        RAISE EXCEPTION 'Invalid approval token format';
    END IF;

    RETURN QUERY
    SELECT p.file_url
    FROM public.proofs p
    WHERE p.approval_token = p_approval_token
    AND p.is_active = true
    AND p.status IN ('Envoyée au client', 'Modification demandée');
END;
$function$;