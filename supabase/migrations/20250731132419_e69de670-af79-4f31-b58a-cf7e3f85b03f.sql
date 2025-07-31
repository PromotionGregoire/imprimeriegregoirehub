-- Update user metadata for display names in auth.users table
-- This requires using the auth admin functions

-- Update Frank Lafond
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"display_name": "Frank Lafond"}'::jsonb
WHERE email = 'frank.lafond@me.com';

-- Update Les Peintures Crête  
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"display_name": "Les Peintures Crête"}'::jsonb
WHERE email = 'frank@lespeinturescrete.ca';

-- Update Admin
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"display_name": "Admin"}'::jsonb
WHERE email = 'info@promotiongregoire.ca';