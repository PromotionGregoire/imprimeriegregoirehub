-- Complete the submissions policies consolidation

-- Unified submissions policies
CREATE POLICY "Unified submissions select access"
ON public.submissions
FOR SELECT
USING (
  -- Authenticated users can see all submissions
  (SELECT auth.uid()) IS NOT NULL
  OR
  -- Public access with valid acceptance token
  (acceptance_token IS NOT NULL AND acceptance_token <> '' AND valid_until > now())
  OR
  -- Public access with valid approval token
  (approval_token IS NOT NULL AND approval_token <> '' AND valid_until > now())
);

CREATE POLICY "Unified submissions insert access"
ON public.submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Unified submissions update access"
ON public.submissions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Unified submissions delete access"
ON public.submissions
FOR DELETE
TO authenticated
USING (is_admin());