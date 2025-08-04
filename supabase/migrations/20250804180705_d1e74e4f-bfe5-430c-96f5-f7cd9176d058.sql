-- Ajouter la colonne acceptance_token à la table submissions
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS acceptance_token TEXT UNIQUE;

-- Créer un index pour améliorer les performances de recherche par token
CREATE INDEX IF NOT EXISTS idx_submissions_acceptance_token 
ON public.submissions(acceptance_token);

-- Générer des tokens pour les soumissions existantes
UPDATE public.submissions 
SET acceptance_token = gen_random_uuid()::text 
WHERE acceptance_token IS NULL;

-- Rendre la colonne NOT NULL après avoir généré les tokens
ALTER TABLE public.submissions 
ALTER COLUMN acceptance_token SET NOT NULL;

-- Ajouter une contrainte par défaut pour les nouvelles soumissions
ALTER TABLE public.submissions 
ALTER COLUMN acceptance_token SET DEFAULT gen_random_uuid()::text;