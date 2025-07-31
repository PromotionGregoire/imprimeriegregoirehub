-- Corriger la fonction is_admin() pour qu'elle soit sécurisée et fonctionne correctement
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  );
$function$;

-- Supprimer les anciennes politiques conflictuelles 
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles for login" ON public.profiles;

-- Créer de nouvelles politiques RLS plus claires et sécurisées
-- Politique pour les admins : accès complet à toutes les données
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Politique pour les utilisateurs : peuvent voir et modifier leur propre profil uniquement
CREATE POLICY "Users can view and update their own profile" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique pour la lecture publique (nécessaire pour l'authentification)
CREATE POLICY "Anyone can view profiles for login" 
ON public.profiles 
FOR SELECT 
TO anon, authenticated
USING (true);