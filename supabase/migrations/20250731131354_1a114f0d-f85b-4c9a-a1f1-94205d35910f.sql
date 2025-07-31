-- Add HR fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN job_title TEXT,
ADD COLUMN employment_status TEXT CHECK (employment_status IN ('Temps plein', 'Temps partiel', 'Contractuel')),
ADD COLUMN hire_date DATE,
ADD COLUMN emergency_contact_name TEXT,
ADD COLUMN emergency_contact_phone TEXT,
ADD COLUMN password_reset_required BOOLEAN DEFAULT false;

-- Update existing admin user to not require password reset
UPDATE public.profiles 
SET password_reset_required = false 
WHERE role = 'ADMIN';

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  );
$$;

-- Add RLS policy for admin-only access to employee management
CREATE POLICY "Only admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.is_admin() OR auth.uid() = id)
WITH CHECK (public.is_admin() OR auth.uid() = id);