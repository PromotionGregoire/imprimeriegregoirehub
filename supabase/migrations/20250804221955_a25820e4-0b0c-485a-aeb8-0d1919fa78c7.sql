-- Créer une politique RLS pour permettre l'accès public aux épreuves via approval_token
CREATE POLICY "Public access to proofs with valid approval token" 
ON public.proofs 
FOR SELECT 
USING (
  (approval_token IS NOT NULL) AND 
  (approval_token <> '') AND 
  (is_active = true)
);