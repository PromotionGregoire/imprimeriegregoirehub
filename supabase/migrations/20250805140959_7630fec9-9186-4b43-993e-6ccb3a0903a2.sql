-- Create indexes for foreign key columns to improve query performance
-- This addresses the performance advisor suggestions for unindexed foreign keys

-- Activity Logs: Index for created_by foreign key
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_by ON public.activity_logs (created_by);

-- Email Notifications: Index for proof_id foreign key  
CREATE INDEX IF NOT EXISTS idx_email_notifications_proof_id ON public.email_notifications (proof_id);

-- Epreuve Commentaires: Index for proof_id foreign key
CREATE INDEX IF NOT EXISTS idx_epreuve_commentaires_proof_id ON public.epreuve_commentaires (proof_id);

-- Ordre Historique: Indexes for created_by and proof_id foreign keys
CREATE INDEX IF NOT EXISTS idx_ordre_historique_created_by ON public.ordre_historique (created_by);
CREATE INDEX IF NOT EXISTS idx_ordre_historique_proof_id ON public.ordre_historique (proof_id);

-- System Logs: Index for created_by foreign key
CREATE INDEX IF NOT EXISTS idx_system_logs_created_by ON public.system_logs (created_by);