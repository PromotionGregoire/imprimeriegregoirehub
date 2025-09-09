-- ===================================================
-- PHASE 1: Amélioration de l'observabilité (0% risque)
-- ===================================================

-- 1) Ajouter la colonne idempotency_key pour éviter les doublons
ALTER TABLE public.activity_logs 
ADD COLUMN IF NOT EXISTS idempotency_key text;

-- 2) Index unique pour prévenir les actions dupliquées  
CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_logs_idempotency
ON public.activity_logs (action_type, idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- 3) Index de performance pour activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_performance
ON public.activity_logs (action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_client
ON public.activity_logs (client_id, created_at DESC);

-- 4) Index de performance pour email_notifications  
CREATE INDEX IF NOT EXISTS idx_email_notifications_proof_date
ON public.email_notifications (proof_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_notifications_success_type
ON public.email_notifications (email_type, success, created_at DESC);

-- 5) Index pour ordre_historique (amélioration des requêtes d'audit)
CREATE INDEX IF NOT EXISTS idx_ordre_historique_order_date  
ON public.ordre_historique (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ordre_historique_action_date
ON public.ordre_historique (action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ordre_historique_client_actions
ON public.ordre_historique (client_action, created_at DESC);

-- 6) Commentaire pour documenter les améliorations
COMMENT ON COLUMN public.activity_logs.idempotency_key IS 'Clé unique pour éviter les actions dupliquées (UUID recommandé)';
COMMENT ON INDEX idx_activity_logs_idempotency IS 'Prévient les doublons d''actions critiques (envoi email, décisions)';

-- 7) Fonction utilitaire pour générer des clés d'idempotence
CREATE OR REPLACE FUNCTION public.generate_idempotency_key(
  p_action_type text,
  p_entity_id uuid,
  p_additional_context text DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Génère une clé d'idempotence basée sur l'action, l'entité et le contexte
  RETURN encode(
    digest(
      p_action_type || ':' || 
      p_entity_id::text || 
      COALESCE(':' || p_additional_context, ''),
      'sha256'
    ),
    'hex'
  );
END;
$$;

-- Exemple d'usage: 
-- SELECT generate_idempotency_key('send_proof_email', proof_id, current_date::text);