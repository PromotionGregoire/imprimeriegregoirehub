-- Fix critical RLS policy issues causing internal errors

-- First, fix the infinite recursion in projects and project_members
DROP POLICY IF EXISTS "project_members_recursive_policy" ON project_members;
DROP POLICY IF EXISTS "projects_recursive_policy" ON projects;

-- Fix core table access policies
-- Profiles table - essential for user data
DROP POLICY IF EXISTS "profiles_access" ON profiles;
CREATE POLICY "profiles_access" ON profiles FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Clients table - essential for business operations
DROP POLICY IF EXISTS "clients_access" ON clients;
CREATE POLICY "clients_access" ON clients FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Submissions table - core functionality
DROP POLICY IF EXISTS "submissions_access" ON submissions;
CREATE POLICY "submissions_access" ON submissions FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Orders table - core functionality
DROP POLICY IF EXISTS "orders_access" ON orders;
CREATE POLICY "orders_access" ON orders FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Proofs table - core functionality
DROP POLICY IF EXISTS "proofs_access" ON proofs;
CREATE POLICY "proofs_access" ON proofs FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Products table - essential for operations
DROP POLICY IF EXISTS "products_access" ON products;
CREATE POLICY "products_access" ON products FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Suppliers table - business operations
DROP POLICY IF EXISTS "suppliers_access" ON suppliers;
CREATE POLICY "suppliers_access" ON suppliers FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Activity logs - for audit trail
DROP POLICY IF EXISTS "activity_logs_access" ON activity_logs;
CREATE POLICY "activity_logs_access" ON activity_logs FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Order history - for tracking changes
DROP POLICY IF EXISTS "ordre_historique_access" ON ordre_historique;
CREATE POLICY "ordre_historique_access" ON ordre_historique FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Submission items - related data
DROP POLICY IF EXISTS "submission_items_access" ON submission_items;
CREATE POLICY "submission_items_access" ON submission_items FOR ALL USING (
  auth.uid() IS NOT NULL
);