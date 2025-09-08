-- Fix security vulnerability: Require authentication for financial information access
-- Remove token-based access to sensitive financial data in submissions and submission_items

-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Unified submissions select access" ON public.submissions;
DROP POLICY IF EXISTS "Consolidated submission items select access" ON public.submission_items;

-- Create secure policy that requires authentication for all submission data access
-- This protects sensitive financial information (total_price)
CREATE POLICY "Authenticated users can view submissions" 
ON public.submissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create secure policy that requires authentication for all submission item data access  
-- This protects sensitive financial information (unit_price)
CREATE POLICY "Authenticated users can view submission items"
ON public.submission_items 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create a database function to provide limited submission data for token-based access
-- This excludes financial information for security
CREATE OR REPLACE FUNCTION public.get_submission_for_approval(
    p_token TEXT,
    p_token_type TEXT DEFAULT 'approval'
)
RETURNS TABLE (
    id UUID,
    submission_number TEXT,
    client_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ, 
    deadline TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    status TEXT,
    approved_by TEXT,
    modification_request_notes TEXT,
    business_name TEXT,
    contact_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
$$;

-- Create function to get submission items for token-based access without financial data
CREATE OR REPLACE FUNCTION public.get_submission_items_for_approval(
    p_token TEXT,
    p_token_type TEXT DEFAULT 'approval'
)
RETURNS TABLE (
    id UUID,
    submission_id UUID,
    product_name TEXT,
    description TEXT,
    quantity INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        si.id,
        si.submission_id,
        si.product_name,
        si.description,
        si.quantity,
        si.created_at,
        si.updated_at
        -- Explicitly exclude si.unit_price (sensitive financial data)
    FROM public.submission_items si
    JOIN public.submissions s ON si.submission_id = s.id
    WHERE (
        (p_token_type = 'approval' AND s.approval_token = p_token) OR
        (p_token_type = 'acceptance' AND s.acceptance_token = p_token)
    )
    AND s.valid_until > NOW()
    AND p_token IS NOT NULL
    AND p_token != '';
END;
$$;

-- Add security comments explaining the approach
COMMENT ON FUNCTION public.get_submission_for_approval IS 'Secure function for token-based submission access that excludes sensitive financial information (total_price)';
COMMENT ON FUNCTION public.get_submission_items_for_approval IS 'Secure function for token-based submission item access that excludes sensitive financial information (unit_price)';

-- Grant necessary permissions to authenticated and anonymous users for the functions
GRANT EXECUTE ON FUNCTION public.get_submission_for_approval TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_submission_items_for_approval TO authenticated, anon;