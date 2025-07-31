-- Add email column to profiles table to store user emails for login
ALTER TABLE public.profiles ADD COLUMN email text;

-- Update existing profiles with their corresponding emails from auth.users
UPDATE public.profiles 
SET email = 'info@promotiongregoire.ca'
WHERE id = '55c99832-ce0f-45cc-8fe3-a3a69ab44bdd';

UPDATE public.profiles 
SET email = 'frank.lafond@me.com'
WHERE id = 'c1ff4814-0f0f-4d73-a7e3-8d235d7aa8ed';

UPDATE public.profiles 
SET email = 'frank@lespeinturescrete.ca'
WHERE id = '5e129a2a-4cdf-4624-af7a-34f68ae5d6bf';