-- Optimiser la politique RLS pour public.clients
-- Le problème : auth.uid() dans get_user_role() est réévalué pour chaque ligne
-- Solution : utiliser (select auth.uid()) pour une évaluation unique

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clients;

-- Créer une politique optimisée en utilisant la fonction is_admin() qui est plus performante
CREATE POLICY "Only admins can delete clients" 
ON public.clients 
FOR DELETE 
USING (is_admin());

-- Également optimiser la fonction is_admin() pour être sûr
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (select auth.uid())
    AND role = 'ADMIN'
  );
$function$;

-- Vérifier s'il y a d'autres politiques avec get_user_role() qui pourraient être optimisées
-- Optimiser aussi les autres politiques qui utilisent get_user_role()

-- Pour la table products
DROP POLICY IF EXISTS "Only admins can create products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

CREATE POLICY "Only admins can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update products" 
ON public.products 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete products" 
ON public.products 
FOR DELETE 
USING (is_admin());

-- Pour la table submissions
DROP POLICY IF EXISTS "Only admins can delete submissions" ON public.submissions;

CREATE POLICY "Only admins can delete submissions" 
ON public.submissions 
FOR DELETE 
USING (is_admin());

-- Pour la table orders
DROP POLICY IF EXISTS "Only admins can delete orders" ON public.orders;

CREATE POLICY "Only admins can delete orders" 
ON public.orders 
FOR DELETE 
USING (is_admin());

-- Pour la table proofs
DROP POLICY IF EXISTS "Only admins can delete proofs" ON public.proofs;

CREATE POLICY "Only admins can delete proofs" 
ON public.proofs 
FOR DELETE 
USING (is_admin());