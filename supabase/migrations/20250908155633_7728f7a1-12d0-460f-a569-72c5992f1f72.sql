-- Correction de la récursion infinie dans les policies RLS
-- Créer des fonctions SECURITY DEFINER pour vérification des rôles

-- Fonction pour vérifier si l'utilisateur est admin ou manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'MANAGER')
  );
$$;

-- Fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin_role()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  );
$$;

-- Supprimer toutes les policies problématiques
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

-- Recréer les policies avec les fonctions SECURITY DEFINER

-- PROFILES - Sans récursion
CREATE POLICY "profiles_secure_read" ON profiles
FOR SELECT USING (
  public.is_admin_or_manager() OR id = auth.uid()
);

CREATE POLICY "profiles_secure_insert" ON profiles
FOR INSERT WITH CHECK (
  public.is_admin_or_manager() OR id = auth.uid()
);

CREATE POLICY "profiles_secure_update" ON profiles
FOR UPDATE USING (
  public.is_admin_or_manager() OR id = auth.uid()
) WITH CHECK (
  public.is_admin_or_manager() OR id = auth.uid()
);

CREATE POLICY "profiles_secure_delete" ON profiles
FOR DELETE USING (
  public.is_admin_role()
);

-- CLIENTS - Accès basé sur assignation
CREATE POLICY "clients_secure_read" ON clients
FOR SELECT USING (
  assigned_user_id = auth.uid() OR public.is_admin_or_manager()
);

CREATE POLICY "clients_secure_insert" ON clients
FOR INSERT WITH CHECK (
  assigned_user_id = auth.uid() OR public.is_admin_or_manager()
);

CREATE POLICY "clients_secure_update" ON clients
FOR UPDATE USING (
  assigned_user_id = auth.uid() OR public.is_admin_or_manager()
) WITH CHECK (
  assigned_user_id = auth.uid() OR public.is_admin_or_manager()
);

CREATE POLICY "clients_secure_delete" ON clients
FOR DELETE USING (
  public.is_admin_role()
);

-- SUPPLIERS - Admin/Manager seulement
CREATE POLICY "suppliers_secure_read" ON suppliers
FOR SELECT USING (
  public.is_admin_or_manager()
);

CREATE POLICY "suppliers_secure_write" ON suppliers
FOR ALL USING (
  public.is_admin_role()
) WITH CHECK (
  public.is_admin_role()
);

-- INVOICES - Via relation clients
CREATE POLICY "invoices_secure_read" ON invoices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = invoices.client_id
      AND (c.assigned_user_id = auth.uid() OR public.is_admin_or_manager())
  )
);

CREATE POLICY "invoices_secure_write" ON invoices
FOR ALL USING (
  public.is_admin_or_manager()
) WITH CHECK (
  public.is_admin_or_manager()
);

-- PAYMENTS - Via relation invoice->client
CREATE POLICY "payments_secure_read" ON payments
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM invoices i
    JOIN clients c ON c.id = i.client_id
    WHERE i.id = payments.invoice_id
      AND (c.assigned_user_id = auth.uid() OR public.is_admin_or_manager())
  )
);

CREATE POLICY "payments_secure_write" ON payments
FOR ALL USING (
  public.is_admin_or_manager()
) WITH CHECK (
  public.is_admin_or_manager()
);

-- PROOFS - Via relation order->client
CREATE POLICY "proofs_secure_staff_read" ON proofs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = proofs.order_id
      AND (c.assigned_user_id = auth.uid() OR public.is_admin_or_manager())
  )
);

CREATE POLICY "proofs_secure_write" ON proofs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = proofs.order_id
      AND (c.assigned_user_id = auth.uid() OR public.is_admin_or_manager())
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = proofs.order_id
      AND (c.assigned_user_id = auth.uid() OR public.is_admin_or_manager())
  )
);

-- COMMENTAIRES - Via relation order->client
CREATE POLICY "comments_secure_read" ON epreuve_commentaires
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = epreuve_commentaires.order_id
      AND (c.assigned_user_id = auth.uid() OR public.is_admin_or_manager())
  )
);

CREATE POLICY "comments_secure_write" ON epreuve_commentaires
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = epreuve_commentaires.order_id
      AND (c.assigned_user_id = auth.uid() OR public.is_admin_or_manager())
  )
) WITH CHECK (
  EXISTS(
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = epreuve_commentaires.order_id
      AND (c.assigned_user_id = auth.uid() OR public.is_admin_or_manager())
  )
);

-- Accorder les permissions sur les nouvelles fonctions
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_role() TO authenticated;