-- Insert ADMIN profile for the specific email
INSERT INTO public.profiles (id, full_name, role)
SELECT 
    id,
    'ADMIN',
    'ADMIN'
FROM auth.users 
WHERE email = 'info@promotiongregoire.ca'
ON CONFLICT (id) DO UPDATE SET 
    full_name = 'ADMIN',
    role = 'ADMIN';

-- Update any existing "Nouvel Employé" profiles to have proper names
-- You can manually update these after seeing what users exist
-- This is just a placeholder for the admin user