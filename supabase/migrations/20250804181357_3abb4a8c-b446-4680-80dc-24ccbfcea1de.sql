-- Ajouter la colonne valid_until si elle n'existe pas
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP WITH TIME ZONE;

-- Mettre à jour les soumissions existantes avec une date de validité de 30 jours
UPDATE public.submissions 
SET valid_until = created_at + INTERVAL '30 days'
WHERE valid_until IS NULL;

-- Rendre la colonne NOT NULL
ALTER TABLE public.submissions 
ALTER COLUMN valid_until SET NOT NULL;

-- Ajouter une valeur par défaut pour les nouvelles soumissions
ALTER TABLE public.submissions 
ALTER COLUMN valid_until SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');