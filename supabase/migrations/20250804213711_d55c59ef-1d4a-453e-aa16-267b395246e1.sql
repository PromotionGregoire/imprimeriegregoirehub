-- Ajouter une politique pour l'accès public aux soumissions via approval_token
CREATE POLICY "Public access to submissions with valid approval token" 
ON public.submissions 
FOR SELECT 
TO anon, authenticated
USING (
  (approval_token IS NOT NULL) AND 
  (approval_token <> '') AND 
  (valid_until > now())
);

-- Ajouter une politique pour l'accès public aux clients via approval_token  
CREATE POLICY "Public read clients via approval token" 
ON public.clients 
FOR SELECT 
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM submissions s
    WHERE s.client_id = clients.id 
    AND s.approval_token IS NOT NULL 
    AND s.approval_token <> '' 
    AND s.valid_until > now()
  )
);

-- Ajouter une politique pour l'accès public aux submission_items via approval_token
CREATE POLICY "Public read submission items via approval token" 
ON public.submission_items 
FOR SELECT 
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM submissions s
    WHERE s.id = submission_items.submission_id 
    AND s.approval_token IS NOT NULL 
    AND s.approval_token <> '' 
    AND s.valid_until > now()
  )
);