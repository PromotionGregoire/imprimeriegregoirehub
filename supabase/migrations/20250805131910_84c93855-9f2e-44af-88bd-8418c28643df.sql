-- Drop unused indexes identified by performance analysis
-- These indexes are not being used by queries and create unnecessary maintenance overhead

-- Drop unused epreuve_commentaires index
DROP INDEX IF EXISTS public.idx_epreuve_commentaires_proof_id;

-- Drop unused activity_logs index
DROP INDEX IF EXISTS public.idx_activity_logs_created_by;

-- Drop unused email_notifications index
DROP INDEX IF EXISTS public.idx_email_notifications_proof_id;

-- Drop unused ordre_historique indexes (2 indexes)
DROP INDEX IF EXISTS public.idx_ordre_historique_created_by;
DROP INDEX IF EXISTS public.idx_ordre_historique_proof_id;

-- Drop unused system_logs index
DROP INDEX IF EXISTS public.idx_system_logs_created_by;