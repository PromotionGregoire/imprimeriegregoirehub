-- Fix security vulnerability: Restrict ordre_historique access to authenticated users only
-- Current policy allows public access to sensitive business operations history

-- Drop the existing overly permissive policy that uses "true" for everyone
DROP POLICY IF EXISTS "Users can view order history" ON public.ordre_historique;

-- Create secure policy requiring authentication for viewing order history
CREATE POLICY "Authenticated users can view order history" 
ON public.ordre_historique 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- The table already correctly restricts INSERT/UPDATE/DELETE operations
-- We only need to secure the SELECT operations which were previously public