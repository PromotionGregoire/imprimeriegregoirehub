-- Fix RLS policies that are too restrictive and causing application errors

-- Fix proofs table policies - allow basic authenticated access for internal operations
DROP POLICY IF EXISTS "Authenticated users can view proofs" ON public.proofs;
CREATE POLICY "Authenticated users can view proofs" 
ON public.proofs FOR SELECT 
TO authenticated
USING (true);

-- Fix submissions table policies - allow authenticated access for internal operations  
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.submissions;
CREATE POLICY "Authenticated users can view submissions"
ON public.submissions FOR SELECT
TO authenticated 
USING (true);

-- Fix submission_items table policies - allow authenticated access for internal operations
DROP POLICY IF EXISTS "Authenticated users can view submission items" ON public.submission_items;
CREATE POLICY "Authenticated users can view submission items"
ON public.submission_items FOR SELECT
TO authenticated
USING (true);

-- Ensure basic operations work for authenticated users
UPDATE public.profiles SET password_reset_required = false WHERE password_reset_required IS NULL;