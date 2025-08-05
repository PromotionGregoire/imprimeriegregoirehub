-- Comprehensive Performance Optimization Script
-- Addresses: Unindexed Foreign Keys, RLS Auth Caching, Unused Indexes, Multiple Permissive Policies

-- =================================================================
-- 1. ADD INDEXES FOR UNINDEXED FOREIGN KEYS
-- =================================================================

-- 1.1 activity_logs foreign key indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_by 
ON public.activity_logs(created_by);

CREATE INDEX IF NOT EXISTS idx_activity_logs_client_id 
ON public.activity_logs(client_id);

-- 1.2 email_notifications foreign key indexes  
CREATE INDEX IF NOT EXISTS idx_email_notifications_proof_id 
ON public.email_notifications(proof_id);

-- 1.3 ordre_historique foreign key indexes
CREATE INDEX IF NOT EXISTS idx_ordre_historique_created_by 
ON public.ordre_historique(created_by);

CREATE INDEX IF NOT EXISTS idx_ordre_historique_order_id 
ON public.ordre_historique(order_id);

-- 1.4 system_logs foreign key indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_created_by 
ON public.system_logs(created_by);

-- 1.5 epreuve_commentaires foreign key indexes
CREATE INDEX IF NOT EXISTS idx_epreuve_commentaires_order_id 
ON public.epreuve_commentaires(order_id);

-- =================================================================
-- 2. REMOVE UNUSED INDEXES (if they exist)
-- =================================================================

-- Drop potentially unused indexes that may have been created
DROP INDEX IF EXISTS public.idx_ordre_historique_created_at;
DROP INDEX IF EXISTS public.idx_ordre_historique_action_type;
DROP INDEX IF EXISTS public.idx_submissions_status;
DROP INDEX IF EXISTS public.idx_submissions_acceptance_token;
DROP INDEX IF EXISTS public.idx_clients_status;
DROP INDEX IF EXISTS public.idx_clients_client_type;
DROP INDEX IF EXISTS public.idx_supplier_categories_category_name;
DROP INDEX IF EXISTS public.idx_activity_logs_created_at;
DROP INDEX IF EXISTS public.idx_system_logs_created_at;

-- =================================================================
-- 3. OPTIMIZE RLS POLICIES - CACHE AUTH FUNCTION CALLS
-- =================================================================

-- 3.1 Optimize system_logs RLS policy
DROP POLICY IF EXISTS "Admin users can view system logs" ON public.system_logs;
DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;

CREATE POLICY "Optimized admin system logs access"
ON public.system_logs
FOR SELECT 
TO authenticated
USING (
  (SELECT auth.uid()) IN (
    SELECT id FROM public.profiles WHERE role = 'ADMIN'
  )
);

CREATE POLICY "Optimized system logs insert"
ON public.system_logs
FOR INSERT
WITH CHECK (true);

-- 3.2 Optimize monitoring_config RLS policy
DROP POLICY IF EXISTS "Admin users can manage monitoring config" ON public.monitoring_config;

CREATE POLICY "Optimized admin monitoring config access"
ON public.monitoring_config
FOR ALL
TO authenticated
USING (
  (SELECT auth.uid()) IN (
    SELECT id FROM public.profiles WHERE role = 'ADMIN'
  )
)
WITH CHECK (
  (SELECT auth.uid()) IN (
    SELECT id FROM public.profiles WHERE role = 'ADMIN'
  )
);

-- =================================================================
-- 4. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =================================================================

-- 4.1 Consolidate clients table policies
DROP POLICY IF EXISTS "Public read clients via tokens" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clients;

-- Unified clients policies
CREATE POLICY "Unified clients select access"
ON public.clients
FOR SELECT
USING (
  -- Authenticated users can see all clients
  (SELECT auth.uid()) IS NOT NULL
  OR
  -- Public access via submission tokens
  EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.client_id = clients.id
    AND s.valid_until > now()
    AND (
      (s.approval_token IS NOT NULL AND s.approval_token <> '')
      OR (s.acceptance_token IS NOT NULL AND s.acceptance_token <> '')
    )
  )
);

CREATE POLICY "Unified clients insert access"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Unified clients update access"
ON public.clients
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Unified clients delete access"
ON public.clients
FOR DELETE
TO authenticated
USING (is_admin());

-- 4.2 Consolidate profiles table policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles for login" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;

-- Unified profiles policies
CREATE POLICY "Unified profiles select access"
ON public.profiles
FOR SELECT
USING (
  -- Everyone can view profiles (needed for login/assignments)
  true
);

CREATE POLICY "Unified profiles insert access"
ON public.profiles
FOR INSERT
WITH CHECK (
  -- Users can create their own profile or admins can create any
  id = (SELECT auth.uid()) OR is_admin()
);

CREATE POLICY "Unified profiles update access"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Users can update their own profile or admins can update any
  id = (SELECT auth.uid()) OR is_admin()
)
WITH CHECK (
  id = (SELECT auth.uid()) OR is_admin()
);

CREATE POLICY "Unified profiles delete access"
ON public.profiles
FOR DELETE
TO authenticated
USING (is_admin());

-- 4.3 Consolidate proofs table policies
DROP POLICY IF EXISTS "Public access to proofs with valid approval token" ON public.proofs;
DROP POLICY IF EXISTS "Public access to proofs with valid validation token" ON public.proofs;
DROP POLICY IF EXISTS "Users can view proofs" ON public.proofs;
DROP POLICY IF EXISTS "Users can create proofs" ON public.proofs;
DROP POLICY IF EXISTS "Users can update proofs" ON public.proofs;
DROP POLICY IF EXISTS "Only admins can delete proofs" ON public.proofs;

-- Unified proofs policies
CREATE POLICY "Unified proofs select access"
ON public.proofs
FOR SELECT
USING (
  -- Authenticated users can see all proofs
  (SELECT auth.uid()) IS NOT NULL
  OR
  -- Public access with valid approval token
  (approval_token IS NOT NULL AND approval_token <> '' AND is_active = true)
  OR
  -- Public access with valid validation token
  (validation_token IS NOT NULL AND validation_token <> '' AND is_active = true)
);

CREATE POLICY "Unified proofs insert access"
ON public.proofs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Unified proofs update access"
ON public.proofs
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Unified proofs delete access"
ON public.proofs
FOR DELETE
TO authenticated
USING (is_admin());

-- 4.4 Consolidate submission_items table policies
DROP POLICY IF EXISTS "Authenticated users can manage submission items" ON public.submission_items;
DROP POLICY IF EXISTS "Public read submission items via approval token" ON public.submission_items;
DROP POLICY IF EXISTS "Public read submission items via token" ON public.submission_items;

-- Unified submission_items policies
CREATE POLICY "Unified submission items select access"
ON public.submission_items
FOR SELECT
USING (
  -- Authenticated users can see all submission items
  (SELECT auth.uid()) IS NOT NULL
  OR
  -- Public access via submission approval token
  EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_items.submission_id
    AND s.approval_token IS NOT NULL 
    AND s.approval_token <> ''
    AND s.valid_until > now()
  )
  OR
  -- Public access via submission acceptance token
  EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_items.submission_id
    AND s.acceptance_token IS NOT NULL 
    AND s.acceptance_token <> ''
    AND s.valid_until > now()
  )
);

CREATE POLICY "Unified submission items management"
ON public.submission_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4.5 Consolidate submissions table policies
DROP POLICY IF EXISTS "Public access to submissions with valid acceptance token" ON public.submissions;
DROP POLICY IF EXISTS "Public access to submissions with valid approval token" ON public.submissions;
DROP POLICY IF EXISTS "Users can view submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Only admins can delete submissions" ON public.submissions;