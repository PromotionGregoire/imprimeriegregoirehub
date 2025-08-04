-- Table pour les logs système de monitoring
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_system_logs_type ON public.system_logs(type);
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- Table pour stocker les paramètres de monitoring
CREATE TABLE IF NOT EXISTS public.monitoring_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Valeurs par défaut pour la configuration
INSERT INTO public.monitoring_config (key, value, description) VALUES
    ('admin_email', 'admin@promotiongregoire.com', 'Email administrateur pour les alertes'),
    ('proof_pending_hours', '48', 'Heures avant alerte pour épreuves en attente'),
    ('submission_draft_days', '7', 'Jours avant alerte pour soumissions en brouillon'),
    ('storage_warning_percent', '80', 'Pourcentage stockage pour alerte warning'),
    ('storage_critical_percent', '90', 'Pourcentage stockage pour alerte critique'),
    ('email_error_threshold', '10', 'Nombre erreurs emails avant alerte'),
    ('order_stuck_days', '30', 'Jours avant alerte pour commandes bloquées')
ON CONFLICT (key) DO NOTHING;

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
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );