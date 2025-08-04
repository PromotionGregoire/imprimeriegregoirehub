-- PHASE 3B : CONSTRUCTION DE LA TIMELINE DE L'HISTORIQUE
-- Création d'une vue pour simplifier les requêtes d'historique avec les détails des employés

CREATE OR REPLACE VIEW public.v_order_history_details AS
SELECT 
    oh.id,
    oh.order_id,
    oh.action_type,
    oh.action_description,
    oh.metadata,
    oh.proof_id,
    oh.client_action,
    oh.created_at,
    -- Formatage de la date pour affichage
    TO_CHAR(oh.created_at, 'DD Mon YYYY - HH24:MI') as formatted_date,
    -- Informations de l'employé (si ce n'est pas une action client)
    CASE 
        WHEN oh.client_action = true THEN 'Action Client'
        WHEN oh.created_by IS NULL THEN 'Système'
        ELSE COALESCE(p.full_name, 'Employé inconnu')
    END as author_name,
    -- Informations complémentaires
    p.full_name as employee_full_name,
    p.job_title as employee_job_title
FROM public.ordre_historique oh
LEFT JOIN public.profiles p ON oh.created_by = p.id
ORDER BY oh.created_at DESC;

-- Ajout d'un commentaire explicatif
COMMENT ON VIEW public.v_order_history_details IS 'Vue qui joint ordre_historique avec profiles pour afficher les détails complets de l''historique des commandes incluant les noms des employés';