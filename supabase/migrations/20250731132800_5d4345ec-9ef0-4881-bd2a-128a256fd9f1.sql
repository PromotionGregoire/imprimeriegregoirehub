-- Add a policy to allow anyone to read profiles for login purposes
-- This is needed so the login page can show the list of employees
CREATE POLICY "Anyone can view profiles for login" 
ON public.profiles 
FOR SELECT 
TO anon, authenticated
USING (true);