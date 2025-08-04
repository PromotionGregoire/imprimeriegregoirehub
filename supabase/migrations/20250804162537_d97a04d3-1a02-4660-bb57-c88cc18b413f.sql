-- Mettre à jour l'email admin pour les alertes de monitoring
UPDATE public.monitoring_config 
SET 
    value = 'info@promotiongregoire.ca',
    description = 'Email administrateur pour recevoir les alertes de monitoring',
    updated_at = NOW()
WHERE key = 'admin_email';

-- Ajouter une configuration pour l'email du développeur
INSERT INTO public.monitoring_config (key, value, description)
VALUES (
    'developer_email', 
    'Frank@laboite.agency', 
    'Email du développeur pour les alertes techniques critiques'
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();

-- Ajouter une configuration pour différents niveaux d'alertes
INSERT INTO public.monitoring_config (key, value, description)
VALUES 
    ('alert_level_critical', 'info@promotiongregoire.ca,Frank@laboite.agency', 'Destinataires pour alertes critiques'),
    ('alert_level_warning', 'info@promotiongregoire.ca', 'Destinataires pour avertissements'),
    ('alert_level_info', '', 'Destinataires pour informations (vide = pas d''envoi)')
ON CONFLICT (key) DO NOTHING;