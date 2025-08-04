-- Corriger l'email admin principal
UPDATE public.monitoring_config 
SET 
    value = 'info@promotiongregoire.ca',
    description = 'Email administrateur principal pour les alertes',
    updated_at = NOW()
WHERE key = 'admin_email';

-- Ajouter l'email du développeur
INSERT INTO public.monitoring_config (key, value, description)
VALUES (
    'developer_email', 
    'Frank@laboite.agency', 
    'Email développeur (alertes critiques uniquement)'
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();

-- Vérifier que les changements sont appliqués
SELECT * FROM public.monitoring_config WHERE key IN ('admin_email', 'developer_email');