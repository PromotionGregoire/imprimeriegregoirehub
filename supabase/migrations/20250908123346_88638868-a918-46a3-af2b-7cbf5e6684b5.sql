-- Fix security vulnerability: Restrict activity_logs access to authenticated users only
-- Current policy allows public access to sensitive internal business operations

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage activity logs" ON public.activity_logs;

-- Create secure policies with proper authentication requirements

-- Allow authenticated users to view activity logs
CREATE POLICY "Authenticated users can view activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create activity logs (needed for system functionality)
CREATE POLICY "Authenticated users can create activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Restrict updates to admin users only (activity logs should generally be immutable)
CREATE POLICY "Only admins can update activity logs" 
ON public.activity_logs 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

-- Restrict deletes to admin users only 
CREATE POLICY "Only admins can delete activity logs" 
ON public.activity_logs 
FOR DELETE 
USING (is_admin());