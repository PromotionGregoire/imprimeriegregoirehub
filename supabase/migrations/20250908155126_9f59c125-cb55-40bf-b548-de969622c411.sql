-- Correction des vues Security Definer problématiques

-- Identifier et corriger les vues SECURITY DEFINER
-- Remplacer par des vues normales ou des fonctions appropriées

-- Création d'une vue sécurisée pour les données d'ordre historique
DROP VIEW IF EXISTS v_ordre_historique;
CREATE VIEW v_ordre_historique AS
SELECT 
  h.id,
  h.order_id,
  h.action_type,
  h.action_description,
  h.created_at,
  h.client_action,
  h.metadata,
  h.proof_id,
  TO_CHAR(h.created_at, 'DD/MM/YYYY à HH24:MI') as formatted_date,
  CASE 
    WHEN h.client_action THEN 'Client'
    ELSE COALESCE(p.full_name, 'Système')
  END as created_by_name,
  CASE 
    WHEN h.client_action THEN c.email
    ELSE p.email
  END as created_by_email,
  o.order_number,
  c.business_name,
  c.contact_name,
  c.id as client_id,
  pr.version as proof_version,
  pr.status as proof_status
FROM ordre_historique h
LEFT JOIN profiles p ON h.created_by = p.id
LEFT JOIN orders o ON h.order_id = o.id
LEFT JOIN submissions s ON o.submission_id = s.id
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN proofs pr ON h.proof_id = pr.id;

-- Création d'une vue sécurisée pour les détails d'historique d'ordre
DROP VIEW IF EXISTS v_order_history_details;
CREATE VIEW v_order_history_details AS
SELECT 
  h.id,
  h.order_id,
  h.action_type,
  h.action_description,
  h.created_at,
  h.client_action,
  h.metadata,
  h.proof_id,
  COALESCE(p.full_name, 'Client') as author_name,
  p.full_name as employee_full_name,
  p.job_title as employee_job_title
FROM ordre_historique h
LEFT JOIN profiles p ON h.created_by = p.id;

-- Révocation et réaccordage des permissions sur les fonctions critiques
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- Réaccorder uniquement les fonctions publiques sécurisées
GRANT EXECUTE ON FUNCTION public.get_submission_for_approval(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_submission_items_for_approval(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_proof_for_approval(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_proof_file_url(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- Fonctions utilitaires pour la génération de numéros (accessibles aux utilisateurs authentifiés)
GRANT EXECUTE ON FUNCTION public.generate_client_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated;  
GRANT EXECUTE ON FUNCTION public.generate_submission_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_product_code(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_proof_version(uuid) TO authenticated;

-- Fonctions d'historique (accès contrôlé)
GRANT EXECUTE ON FUNCTION public.get_order_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_ordre_history(uuid, text, text, jsonb, uuid, boolean, uuid) TO authenticated;