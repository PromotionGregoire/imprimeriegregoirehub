-- Optimiser les politiques RLS pour public.email_notifications
-- Problème : Multiples politiques permissives pour SELECT causent des problèmes de performance
-- Solution : Consolider les politiques en une seule

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Admins can view all email notifications" ON public.email_notifications;
DROP POLICY IF EXISTS "Users can view email notifications for their proofs" ON public.email_notifications;

-- Créer une politique consolidée qui combine les conditions admin et utilisateur
CREATE POLICY "View email notifications" 
ON public.email_notifications 
FOR SELECT 
USING (
  -- Condition 1: Les admins peuvent voir toutes les notifications
  is_admin()
  OR 
  -- Condition 2: Les utilisateurs peuvent voir les notifications de leurs épreuves
  EXISTS (
    SELECT 1
    FROM ((proofs p
      JOIN orders o ON ((p.order_id = o.id)))
      JOIN submissions s ON ((o.submission_id = s.id)))
    WHERE p.id = email_notifications.proof_id
  )
);