-- Update the full_name for existing users based on their email
UPDATE public.profiles 
SET full_name = 'Frank Lafond'
WHERE id = (SELECT id FROM auth.users WHERE email = 'frank.lafond@me.com');

UPDATE public.profiles 
SET full_name = 'Les Peintures Crête'
WHERE id = (SELECT id FROM auth.users WHERE email = 'frank@lespeinturescrete.ca');

UPDATE public.profiles 
SET full_name = 'Admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'info@promotiongregoire.ca');