-- PHASE 2A: Correction de la sécurité de la VIEW v_order_history_details
-- Ajouter SECURITY INVOKER pour corriger la faille identifiée par le Security Advisor

CREATE OR REPLACE VIEW public.v_order_history_details
WITH (security_invoker=on) AS
SELECT
    oh.id,
    oh.order_id,
    oh.action_type,
    oh.action_description,
    oh.metadata,
    oh.proof_id,
    oh.client_action,
    oh.created_at,
    CASE 
        WHEN oh.client_action = true THEN 'Client'
        WHEN p.full_name IS NOT NULL THEN p.full_name
        ELSE 'Système'
    END as author_name,
    p.full_name as employee_full_name,
    p.job_title as employee_job_title
FROM public.ordre_historique oh
LEFT JOIN public.profiles p ON oh.created_by = p.id;

-- PHASE 2B: Création de la fonction d'aide get_user_role()
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
    SELECT role FROM public.profiles WHERE id = user_uuid;
$$;

-- PHASE 2B: Durcissement des politiques RLS - Table clients
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON public.clients;

CREATE POLICY "Users can view clients" ON public.clients
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can create clients" ON public.clients
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Users can update clients" ON public.clients
    FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Only admins can delete clients" ON public.clients
    FOR DELETE 
    TO authenticated 
    USING (get_user_role(auth.uid()) = 'ADMIN');

-- PHASE 2B: Durcissement des politiques RLS - Table orders
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;

CREATE POLICY "Users can view orders" ON public.orders
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Users can update orders" ON public.orders
    FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Only admins can delete orders" ON public.orders
    FOR DELETE 
    TO authenticated 
    USING (get_user_role(auth.uid()) = 'ADMIN');

-- PHASE 2B: Durcissement des politiques RLS - Table submissions
DROP POLICY IF EXISTS "Authenticated users can manage submissions" ON public.submissions;

CREATE POLICY "Users can view submissions" ON public.submissions
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can create submissions" ON public.submissions
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Users can update submissions" ON public.submissions
    FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Only admins can delete submissions" ON public.submissions
    FOR DELETE 
    TO authenticated 
    USING (get_user_role(auth.uid()) = 'ADMIN');

-- PHASE 2B: Durcissement des politiques RLS - Table proofs
DROP POLICY IF EXISTS "Authenticated users can manage proofs" ON public.proofs;

CREATE POLICY "Users can view proofs" ON public.proofs
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can create proofs" ON public.proofs
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Users can update proofs" ON public.proofs
    FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Only admins can delete proofs" ON public.proofs
    FOR DELETE 
    TO authenticated 
    USING (get_user_role(auth.uid()) = 'ADMIN');

-- PHASE 2B: Durcissement des politiques RLS - Table products
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;

CREATE POLICY "Users can view products" ON public.products
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Only admins can create products" ON public.products
    FOR INSERT 
    TO authenticated 
    WITH CHECK (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Only admins can update products" ON public.products
    FOR UPDATE 
    TO authenticated 
    USING (get_user_role(auth.uid()) = 'ADMIN') 
    WITH CHECK (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Only admins can delete products" ON public.products
    FOR DELETE 
    TO authenticated 
    USING (get_user_role(auth.uid()) = 'ADMIN');

-- PHASE 2B: Durcissement des politiques RLS - Table ordre_historique (lecture seule pour utilisateurs)
DROP POLICY IF EXISTS "Authenticated users can insert order history" ON public.ordre_historique;
DROP POLICY IF EXISTS "Authenticated users can view order history" ON public.ordre_historique;

CREATE POLICY "Users can view order history" ON public.ordre_historique
    FOR SELECT 
    TO authenticated 
    USING (true);

-- L'insertion est gérée uniquement par les triggers et edge functions avec SERVICE_ROLE_KEY
-- Pas de politique INSERT/UPDATE/DELETE pour les utilisateurs normaux