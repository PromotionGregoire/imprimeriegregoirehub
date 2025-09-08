-- Création des policies sécurisées selon le plan

-- 🔴 PROFILES - Sécurisation complète
CREATE POLICY "profiles_secure_read" ON profiles
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
  OR id = auth.uid()
);

CREATE POLICY "profiles_secure_insert" ON profiles
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
  OR id = auth.uid()
);

CREATE POLICY "profiles_secure_update" ON profiles
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
  OR id = auth.uid()
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
  OR id = auth.uid()
);

CREATE POLICY "profiles_secure_delete" ON profiles
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

-- 🔴 CLIENTS - Accès basé sur assignation
CREATE POLICY "clients_secure_read" ON clients
FOR SELECT USING (
  assigned_user_id = auth.uid()
  OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

CREATE POLICY "clients_secure_insert" ON clients
FOR INSERT WITH CHECK (
  assigned_user_id = auth.uid()
  OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

CREATE POLICY "clients_secure_update" ON clients
FOR UPDATE USING (
  assigned_user_id = auth.uid()
  OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
) WITH CHECK (
  assigned_user_id = auth.uid()
  OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

CREATE POLICY "clients_secure_delete" ON clients
FOR DELETE USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

-- 🔴 SUPPLIERS - Admin/Manager seulement
CREATE POLICY "suppliers_secure_read" ON suppliers
FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

CREATE POLICY "suppliers_secure_write" ON suppliers
FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
) WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

-- 🟠 INVOICES - Via relation clients
CREATE POLICY "invoices_secure_read" ON invoices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = invoices.client_id
      AND (c.assigned_user_id = auth.uid()
           OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  )
);

CREATE POLICY "invoices_secure_write" ON invoices
FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
) WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

-- 🟠 PAYMENTS - Via relation invoice->client
CREATE POLICY "payments_secure_read" ON payments
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM invoices i
    JOIN clients c ON c.id = i.client_id
    WHERE i.id = payments.invoice_id
      AND (c.assigned_user_id = auth.uid()
           OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  )
);

CREATE POLICY "payments_secure_write" ON payments
FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
) WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

-- 🟠 PROOFS - Via relation order->client
CREATE POLICY "proofs_secure_staff_read" ON proofs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = proofs.order_id
      AND (c.assigned_user_id = auth.uid()
           OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  )
);

CREATE POLICY "proofs_secure_write" ON proofs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = proofs.order_id
      AND (c.assigned_user_id = auth.uid()
           OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = proofs.order_id
      AND (c.assigned_user_id = auth.uid()
           OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  )
);

-- 🟠 COMMENTAIRES - Via relation order->client
CREATE POLICY "comments_secure_read" ON epreuve_commentaires
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = epreuve_commentaires.order_id
      AND (c.assigned_user_id = auth.uid()
           OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  )
);

CREATE POLICY "comments_secure_write" ON epreuve_commentaires
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = epreuve_commentaires.order_id
      AND (c.assigned_user_id = auth.uid()
           OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  )
) WITH CHECK (
  EXISTS(
    SELECT 1 FROM orders o
    JOIN clients c ON c.id = o.client_id
    WHERE o.id = epreuve_commentaires.order_id
      AND (c.assigned_user_id = auth.uid()
           OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  )
);