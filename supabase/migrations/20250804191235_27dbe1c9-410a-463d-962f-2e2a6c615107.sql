-- Ajouter une politique publique pour permettre l'accès aux soumissions avec un token d'acceptation valide
CREATE POLICY "Public access to submissions with valid acceptance token" 
ON public.submissions 
FOR SELECT 
TO anon, authenticated
USING (
  acceptance_token IS NOT NULL 
  AND acceptance_token != ''
  AND valid_until > NOW()
);