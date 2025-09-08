-- =================================================================
-- SÉCURISATION PROMOFLOW - GESTION DES POLITIQUES EXISTANTES
-- =================================================================

-- Supprimer TOUTES les anciennes policies pour recommencer proprement
DROP POLICY IF EXISTS "profiles_secure_read" ON profiles;
DROP POLICY IF EXISTS "profiles_secure_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_secure_update" ON profiles;
DROP POLICY IF EXISTS "profiles_secure_delete" ON profiles;
DROP POLICY IF EXISTS "clients_secure_read" ON clients;
DROP POLICY IF EXISTS "clients_secure_insert" ON clients;
DROP POLICY IF EXISTS "clients_secure_update" ON clients;
DROP POLICY IF EXISTS "clients_secure_delete" ON clients;
DROP POLICY IF EXISTS "suppliers_secure_read" ON suppliers;
DROP POLICY IF EXISTS "suppliers_secure_write" ON suppliers;
DROP POLICY IF EXISTS "invoices_secure_read" ON invoices;
DROP POLICY IF EXISTS "invoices_secure_write" ON invoices;
DROP POLICY IF EXISTS "payments_secure_read" ON payments;
DROP POLICY IF EXISTS "payments_secure_write" ON payments;
DROP POLICY IF EXISTS "proofs_secure_staff_read" ON proofs;
DROP POLICY IF EXISTS "proofs_secure_write" ON proofs;
DROP POLICY IF EXISTS "comments_secure_read" ON epreuve_commentaires;
DROP POLICY IF EXISTS "comments_secure_write" ON epreuve_commentaires;

-- 🔴 SÉCURISATION CRITIQUES

-- 1) Profiles sécurisés
CREATE POLICY "profiles_secure_read" ON profiles
FOR SELECT USING (
  is_admin() OR id = auth.uid()
);

CREATE POLICY "profiles_secure_insert" ON profiles
FOR INSERT WITH CHECK (
  is_admin() OR id = auth.uid()
);

CREATE POLICY "profiles_secure_update" ON profiles
FOR UPDATE USING (
  is_admin() OR id = auth.uid()
) WITH CHECK (
  is_admin() OR id = auth.uid()
);

CREATE POLICY "profiles_secure_delete" ON profiles
FOR DELETE USING (is_admin());

-- 2) Clients sécurisés
CREATE POLICY "clients_secure_read" ON clients
FOR SELECT USING (
  assigned_user_id = auth.uid()
  OR is_admin()
  OR get_user_role(auth.uid()) = 'MANAGER'
);

CREATE POLICY "clients_secure_insert" ON clients
FOR INSERT WITH CHECK (
  assigned_user_id = auth.uid()
  OR is_admin()
  OR get_user_role(auth.uid()) = 'MANAGER'
);

CREATE POLICY "clients_secure_update" ON clients
FOR UPDATE USING (
  assigned_user_id = auth.uid()
  OR is_admin()
  OR get_user_role(auth.uid()) = 'MANAGER'
) WITH CHECK (
  assigned_user_id = auth.uid()
  OR is_admin()
  OR get_user_role(auth.uid()) = 'MANAGER'
);

CREATE POLICY "clients_secure_delete" ON clients
FOR DELETE USING (is_admin());

-- 3) Suppliers sécurisés
CREATE POLICY "suppliers_secure_read" ON suppliers
FOR SELECT USING (
  is_admin() OR get_user_role(auth.uid()) = 'MANAGER'
);

CREATE POLICY "suppliers_secure_write" ON suppliers
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 4) Invoices sécurisées
CREATE POLICY "invoices_secure_read" ON invoices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = invoices.client_id
      AND (c.assigned_user_id = auth.uid() OR is_admin() OR get_user_role(auth.uid()) = 'MANAGER')
  )
);

CREATE POLICY "invoices_secure_write" ON invoices
FOR ALL USING (
  is_admin() OR get_user_role(auth.uid()) = 'MANAGER'
) WITH CHECK (
  is_admin() OR get_user_role(auth.uid()) = 'MANAGER'
);

-- 5) Payments sécurisés
CREATE POLICY "payments_secure_read" ON payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM invoices i
    JOIN clients c ON c.id = i.client_id
    WHERE i.id = payments.invoice_id
      AND (c.assigned_user_id = auth.uid() OR is_admin() OR get_user_role(auth.uid()) = 'MANAGER')
  )
);

CREATE POLICY "payments_secure_write" ON payments
FOR ALL USING (
  is_admin() OR get_user_role(auth.uid()) = 'MANAGER'
) WITH CHECK (
  is_admin() OR get_user_role(auth.uid()) = 'MANAGER'
);

-- 6) Proofs sécurisées
CREATE POLICY "proofs_secure_staff_read" ON proofs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = proofs.order_id
      AND (c.assigned_user_id = auth.uid() OR is_admin() OR get_user_role(auth.uid()) = 'MANAGER')
  )
);

CREATE POLICY "proofs_secure_write" ON proofs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = proofs.order_id
      AND (c.assigned_user_id = auth.uid() OR is_admin() OR get_user_role(auth.uid()) = 'MANAGER')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = proofs.order_id
      AND (c.assigned_user_id = auth.uid() OR is_admin() OR get_user_role(auth.uid()) = 'MANAGER')
  )
);

-- 7) Commentaires sécurisés
CREATE POLICY "comments_secure_read" ON epreuve_commentaires
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = epreuve_commentaires.order_id
      AND (c.assigned_user_id = auth.uid() OR is_admin() OR get_user_role(auth.uid()) = 'MANAGER')
  )
);

CREATE POLICY "comments_secure_write" ON epreuve_commentaires
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = epreuve_commentaires.order_id
      AND (c.assigned_user_id = auth.uid() OR is_admin() OR get_user_role(auth.uid()) = 'MANAGER')
  )
) WITH CHECK (
  EXISTS(
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = epreuve_commentaires.order_id
      AND (c.assigned_user_id = auth.uid() OR is_admin() OR get_user_role(auth.uid()) = 'MANAGER')
  )
);

-- 🔐 RÉVOCATION ET SÉCURISATION GÉNÉRALE
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- Réaccorder uniquement les fonctions nécessaires
GRANT EXECUTE ON FUNCTION public.get_submission_for_approval(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_submission_items_for_approval(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_proof_for_approval(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_proof_file_url(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;