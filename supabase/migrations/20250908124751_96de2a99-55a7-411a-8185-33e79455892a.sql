-- Fix security vulnerability: Secure proofs table from unauthorized access
-- Current policy allows public access to business-critical files and tokens

-- Drop the existing overly permissive policy that allows token-based access
DROP POLICY IF EXISTS "Unified proofs select access" ON public.proofs;

-- Create secure policy that requires authentication for all proof data access
-- This protects sensitive business files, approval tokens, and validation tokens
CREATE POLICY "Authenticated users can view proofs" 
ON public.proofs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create a secure database function for token-based proof approval workflows
-- This excludes sensitive file URLs and internal tokens for security
CREATE OR REPLACE FUNCTION public.get_proof_for_approval(
    p_approval_token TEXT
)
RETURNS TABLE (
    id UUID,
    order_id UUID,
    version INTEGER,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    client_comments TEXT,
    approved_by_name TEXT,
    order_number TEXT,
    business_name TEXT,
    contact_name TEXT,
    submission_number TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validate token format and existence
    IF p_approval_token IS NULL OR p_approval_token = '' THEN
        RETURN;
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
$$;

-- Create function to get proof file URL securely (separate from metadata)
-- This allows controlled file access without exposing tokens or metadata
CREATE OR REPLACE FUNCTION public.get_proof_file_url(
    p_approval_token TEXT
)
RETURNS TABLE (
    file_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
BEGIN
    -- Validate token format and existence
    IF p_approval_token IS NULL OR p_approval_token = '' THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT p.file_url
    FROM public.proofs p
    WHERE p.approval_token = p_approval_token
    AND p.is_active = true
    AND p.status IN ('Envoyée au client', 'Modification demandée');
END;
$$;

-- Create function for validation token access (if needed for internal workflows)
CREATE OR REPLACE FUNCTION public.get_proof_for_validation(
    p_validation_token TEXT
)
RETURNS TABLE (
    id UUID,
    order_id UUID,
    version INTEGER,
    status TEXT,
    file_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  
AS $$
BEGIN
    -- Validate token format and existence
    IF p_validation_token IS NULL OR p_validation_token = '' THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.order_id,
        p.version,
        p.status,
        p.file_url
        -- Limited data for internal validation workflows only
    FROM public.proofs p
    WHERE p.validation_token = p_validation_token
    AND p.is_active = true;
END;
$$;

-- Add security comments explaining the secure approach
COMMENT ON FUNCTION public.get_proof_for_approval IS 'Secure function for token-based proof approval that excludes sensitive file URLs and internal tokens';
COMMENT ON FUNCTION public.get_proof_file_url IS 'Secure function to access proof files with proper token validation, separate from metadata';
COMMENT ON FUNCTION public.get_proof_for_validation IS 'Secure function for internal validation workflows with limited data exposure';

-- Grant necessary permissions for the secure functions
GRANT EXECUTE ON FUNCTION public.get_proof_for_approval TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_proof_file_url TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_proof_for_validation TO authenticated, anon;

-- Add constraint to ensure tokens are properly generated (security best practice)
ALTER TABLE public.proofs 
ADD CONSTRAINT check_approval_token_format 
CHECK (approval_token IS NULL OR length(approval_token) >= 32);

ALTER TABLE public.proofs
ADD CONSTRAINT check_validation_token_format  
CHECK (validation_token IS NULL OR length(validation_token) >= 32);