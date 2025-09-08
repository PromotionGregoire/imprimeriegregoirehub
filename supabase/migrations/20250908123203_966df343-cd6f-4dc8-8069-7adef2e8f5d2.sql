-- Fix security vulnerability: Remove public access to clients table
-- The current policy allows unauthenticated access when submissions have valid tokens
-- This is unnecessary since we handle public submission access via edge functions

-- Drop the existing policy with the security vulnerability
DROP POLICY IF EXISTS "Unified clients select access" ON public.clients;

-- Create a new secure policy that only allows authenticated users
CREATE POLICY "Authenticated clients select access" 
ON public.clients 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Ensure other policies remain secure and functional
-- The insert, update, and delete policies are already properly secured