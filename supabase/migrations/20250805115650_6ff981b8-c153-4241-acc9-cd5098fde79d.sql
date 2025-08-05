-- Optimiser les politiques RLS pour public.clients
-- Problème : Multiples politiques permissives pour SELECT causent des problèmes de performance
-- Solution : Consolider les deux politiques en une seule

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Public read clients via approval token" ON public.clients;
DROP POLICY IF EXISTS "Public read clients via submission token" ON public.clients;

-- Créer une politique consolidée qui combine les deux conditions
CREATE POLICY "Public read clients via tokens" 
ON public.clients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM submissions s
    WHERE s.client_id = clients.id 
    AND s.valid_until > now()
    AND (
      -- Condition 1: submission avec approval_token valide
      (s.approval_token IS NOT NULL AND s.approval_token <> '') 
      OR 
      -- Condition 2: submission avec acceptance_token valide
      (s.acceptance_token IS NOT NULL AND s.acceptance_token <> '')
    )
  )
);