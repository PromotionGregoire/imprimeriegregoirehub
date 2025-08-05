-- Optimiser les politiques RLS pour public.profiles
-- Le problème : auth.uid() est réévalué pour chaque ligne
-- Solution : utiliser (select auth.uid()) pour une évaluation unique

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Créer des politiques optimisées
CREATE POLICY "Users can view and update their own profile" 
ON public.profiles 
FOR ALL 
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- Permettre la lecture publique des profils (pour les listes d'employés, etc.)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Permettre l'insertion pour les nouveaux utilisateurs
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = (select auth.uid()));