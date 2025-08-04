-- Politique pour permettre la lecture des clients via token de soumission
CREATE POLICY "Public read clients via submission token" ON public.clients
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.client_id = clients.id
    AND s.acceptance_token IS NOT NULL
    AND s.acceptance_token != ''
    AND s.valid_until > NOW()
  )
);

-- Politique pour permettre la lecture des items via token de soumission
CREATE POLICY "Public read submission items via token" ON public.submission_items
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_items.submission_id
    AND s.acceptance_token IS NOT NULL
    AND s.acceptance_token != ''
    AND s.valid_until > NOW()
  )
);