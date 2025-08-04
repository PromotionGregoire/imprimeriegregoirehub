-- Créer la table system_logs pour le monitoring
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour les requêtes
CREATE INDEX idx_system_logs_type ON public.system_logs(type);
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- Table pour la configuration du monitoring
CREATE TABLE IF NOT EXISTS public.monitoring_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insérer les valeurs par défaut
INSERT INTO public.monitoring_config (key, value, description) VALUES
('admin_email', 'Frank@laboite.agency', 'Email de contact pour les alertes'),
('proof_pending_hours', '48', 'Heures avant alerte pour épreuves en attente'),
('submission_draft_days', '7', 'Jours avant alerte pour soumissions en brouillon'),
('storage_warning_percent', '80', 'Pourcentage d''espace disque pour alerte'),
('storage_critical_percent', '90', 'Pourcentage d''espace disque critique'),
('email_error_threshold', '10', 'Nombre d''erreurs email avant alerte'),
('order_stuck_days', '30', 'Jours avant alerte pour commandes bloquées')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- RLS pour system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view system logs" ON public.system_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "System can insert logs" ON public.system_logs
    FOR INSERT
    WITH CHECK (true);

-- RLS pour monitoring_config
ALTER TABLE public.monitoring_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage monitoring config" ON public.monitoring_config
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_monitoring_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_monitoring_config_updated_at
    BEFORE UPDATE ON public.monitoring_config
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_config_updated_at();