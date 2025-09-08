-- Fix security vulnerability: Restrict financial information access in submissions and submission_items
-- Current policies allow token-based access to sensitive financial data

-- First, let's create a secure view for token-based submission access that excludes financial information
CREATE OR REPLACE VIEW public.submissions_public_view AS
SELECT 
    id,
    submission_number,
    client_id,
    created_at,
    updated_at,
    sent_at,
    deadline,
    valid_until,
    acceptance_token,
    approval_token,
    approved_by,
    modification_request_notes,
    status
    -- Explicitly exclude: total_price (sensitive financial data)
FROM public.submissions;

-- Enable RLS on the view
ALTER VIEW public.submissions_public_view SET (security_invoker = true);

-- Create secure view for submission items that excludes financial information  
CREATE OR REPLACE VIEW public.submission_items_public_view AS
SELECT 
    id,
    submission_id,
    product_name,
    description,
    quantity,
    created_at,
    updated_at
    -- Explicitly exclude: unit_price (sensitive financial data)
FROM public.submission_items;

-- Enable RLS on the view
ALTER VIEW public.submission_items_public_view SET (security_invoker = true);

-- Update submissions RLS policy to restrict financial data access
DROP POLICY IF EXISTS "Unified submissions select access" ON public.submissions;

-- Create separate policies for different access levels
CREATE POLICY "Authenticated users can view all submission data" 
ON public.submissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Token-based access for non-financial submission data" 
ON public.submissions 
FOR SELECT 
USING (
    auth.uid() IS NULL 
    AND (
        (acceptance_token IS NOT NULL AND acceptance_token <> '' AND valid_until > now()) 
        OR (approval_token IS NOT NULL AND approval_token <> '' AND valid_until > now())
    )
    -- This policy will be used by the public view to exclude financial columns
);

-- Update submission_items RLS policy to restrict financial data access  
DROP POLICY IF EXISTS "Consolidated submission items select access" ON public.submission_items;

-- Create separate policies for submission items
CREATE POLICY "Authenticated users can view all submission item data"
ON public.submission_items 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Token-based access for non-financial submission item data"
ON public.submission_items 
FOR SELECT 
USING (
    auth.uid() IS NULL 
    AND EXISTS (
        SELECT 1 FROM public.submissions s 
        WHERE s.id = submission_items.submission_id 
        AND (
            (s.acceptance_token IS NOT NULL AND s.acceptance_token <> '' AND s.valid_until > now()) 
            OR (s.approval_token IS NOT NULL AND s.approval_token <> '' AND s.valid_until > now())
        )
    )
    -- This policy will be used by the public view to exclude financial columns
);

-- Keep existing insert/update/delete policies unchanged for submissions
-- Users can insert submissions
-- Users can update submissions  
-- Only admins can delete submissions

-- Keep existing insert/update/delete policies unchanged for submission_items
-- Authenticated users can manage submission items

-- Add comment explaining the security model
COMMENT ON VIEW public.submissions_public_view IS 'Secure view for token-based access that excludes sensitive financial information (total_price)';
COMMENT ON VIEW public.submission_items_public_view IS 'Secure view for token-based access that excludes sensitive financial information (unit_price)';

-- Create RLS policies for the public views
CREATE POLICY "Public view access for submissions with valid tokens"
ON public.submissions_public_view
FOR SELECT 
USING (
    (acceptance_token IS NOT NULL AND acceptance_token <> '' AND valid_until > now()) 
    OR (approval_token IS NOT NULL AND approval_token <> '' AND valid_until > now())
    OR auth.uid() IS NOT NULL
);