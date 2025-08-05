-- Fix overlapping RLS policies for submission_items
-- Issue: "Unified submission items management" (FOR ALL) conflicts with "Unified submission items select access" (FOR SELECT)

-- Drop the conflicting policies
DROP POLICY IF EXISTS "Unified submission items management" ON public.submission_items;
DROP POLICY IF EXISTS "Unified submission items select access" ON public.submission_items;

-- Create consolidated, non-overlapping policies
CREATE POLICY "Consolidated submission items select access"
ON public.submission_items
FOR SELECT
USING (
  -- Authenticated users can see all submission items
  (SELECT auth.uid()) IS NOT NULL
  OR
  -- Public access via submission approval token
  EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_items.submission_id
    AND s.approval_token IS NOT NULL 
    AND s.approval_token <> ''
    AND s.valid_until > now()
  )
  OR
  -- Public access via submission acceptance token
  EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_items.submission_id
    AND s.acceptance_token IS NOT NULL 
    AND s.acceptance_token <> ''
    AND s.valid_until > now()
  )
);

-- Separate policies for other operations (authenticated users only)
CREATE POLICY "Submission items insert access"
ON public.submission_items
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Submission items update access"
ON public.submission_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Submission items delete access"
ON public.submission_items
FOR DELETE
TO authenticated
USING (true);