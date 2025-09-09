-- ===================================================
-- PHASE 3: Optimisation des triggers et synchronisation (10% risque)  
-- ===================================================

-- 1) Nouveau trigger unifié pour synchroniser les statuts commande/épreuve
DROP TRIGGER IF EXISTS sync_order_status_from_proof_trigger ON public.proofs;
DROP TRIGGER IF EXISTS set_order_status_on_proof_approval_trigger ON public.proofs;

CREATE TRIGGER sync_order_status_from_proof_trigger
AFTER UPDATE OF status ON public.proofs
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.sync_order_status_from_proof();

-- 2) Désactiver le trigger d'email automatique pour éviter les doublons
-- (Les emails sont maintenant gérés par les Edge Functions avec idempotence)
DROP TRIGGER IF EXISTS proof_notification_trigger ON public.proofs;

-- 3) Commentaires pour documenter les changements
COMMENT ON TRIGGER sync_order_status_from_proof_trigger ON public.proofs IS 'Synchronise automatiquement les statuts commande/épreuve (remplace les anciens triggers)';

-- 4) Vérification de cohérence des statuts existants
-- On corrige les incohérences potentielles entre orders et proofs
UPDATE public.orders o
SET status = 'En production', updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM public.proofs p 
  WHERE p.order_id = o.id 
  AND p.status = 'Approuvée'
  AND o.status != 'En production'
  AND o.status != 'Complétée'
);

-- 5) Index de performance pour les nouvelles requêtes
CREATE INDEX IF NOT EXISTS idx_proofs_order_status
ON public.proofs (order_id, status, version DESC);

-- 6) Statistiques d'amélioration
INSERT INTO public.system_logs (type, level, message, metadata, created_by)
VALUES (
  'MIGRATION', 
  'INFO', 
  'Phase 3: Triggers optimisés et synchronisation améliorée',
  jsonb_build_object(
    'phase', 3,
    'changes', ARRAY[
      'trigger_unified_sync', 
      'disabled_duplicate_emails',
      'status_consistency_check',
      'performance_index'
    ],
    'migration_date', now()
  ),
  auth.uid()
);