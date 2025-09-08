-- =================================================================
-- PLAN DE SÉCURISATION PROMOFLOW - CORRECTIFS LOVABLE/SUPABASE
-- =================================================================

-- 🔴 ERREURS CRITIQUES (Priorité 1)

-- 1) Sécurisation table PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Unified profiles select access" ON profiles;
DROP POLICY IF EXISTS "Unified profiles insert access" ON profiles;
DROP POLICY IF EXISTS "Unified profiles update access" ON profiles;
DROP POLICY IF EXISTS "Unified profiles delete access" ON profiles;

-- Lecture: admin/manager OU soi-même
CREATE POLICY "profiles_secure_read" ON profiles
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
  OR id = auth.uid()
);

-- Insertion: admin/manager OU soi-même 
CREATE POLICY "profiles_secure_insert" ON profiles
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
  OR id = auth.uid()
);

-- Mise à jour: admin/manager OU soi-même
CREATE POLICY "profiles_secure_update" ON profiles
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
  OR id = auth.uid()
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
  OR id = auth.uid()
);

-- Suppression: admin seulement
CREATE POLICY "profiles_secure_delete" ON profiles
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

-- 2) Sécurisation table CLIENTS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Authenticated clients select access" ON clients;
DROP POLICY IF EXISTS "Unified clients insert access" ON clients;
DROP POLICY IF EXISTS "Unified clients update access" ON clients;
DROP POLICY IF EXISTS "Unified clients delete access" ON clients;

-- Lecture: assigné à l'utilisateur OU admin/manager
CREATE POLICY "clients_secure_read" ON clients
FOR SELECT USING (
  assigned_user_id = auth.uid()
  OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

-- Insertion: admin/manager OU assignation à soi-même
CREATE POLICY "clients_secure_insert" ON clients
FOR INSERT WITH CHECK (
  assigned_user_id = auth.uid()
  OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

-- Mise à jour: assigné à l'utilisateur OU admin/manager
CREATE POLICY "clients_secure_update" ON clients
FOR UPDATE USING (
  assigned_user_id = auth.uid()
  OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
) WITH CHECK (
  assigned_user_id = auth.uid()
  OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

-- Suppression: admin seulement
CREATE POLICY "clients_secure_delete" ON clients
FOR DELETE USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

-- 3) Sécurisation table SUPPLIERS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON suppliers;

-- Lecture: admin/manager seulement
CREATE POLICY "suppliers_secure_read" ON suppliers
FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

-- Écriture: admin seulement
CREATE POLICY "suppliers_secure_write" ON suppliers
FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
) WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
);

-- 4) Révocation fonctions Security Definer
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- Réaccorder uniquement les fonctions sécurisées nécessaires
GRANT EXECUTE ON FUNCTION public.get_submission_for_approval(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_submission_items_for_approval(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_proof_for_approval(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_proof_file_url(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- 🟠 AVERTISSEMENTS (Priorité 2)

-- 5) Sécurisation INVOICES et PAYMENTS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies invoices
DROP POLICY IF EXISTS "inv_admin_manager_all" ON invoices;
DROP POLICY IF EXISTS "inv_employee_own_clients" ON invoices;

-- Lecture invoices: client assigné OU admin/manager
CREATE POLICY "invoices_secure_read" ON invoices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = invoices.client_id
      AND (c.assigned_user_id = auth.uid()
           OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  )
);

-- Écriture invoices: admin/manager seulement
CREATE POLICY "invoices_secure_write" ON invoices
FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
) WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

-- Supprimer les anciennes policies payments
DROP POLICY IF EXISTS "pay_admin_manager" ON payments;

-- Lecture payments: via invoice -> client assigné OU admin/manager
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

-- Écriture payments: admin/manager seulement
CREATE POLICY "payments_secure_write" ON payments
FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
) WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

-- 6) Sécurisation PROOFS et COMMENTAIRES
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE epreuve_commentaires ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies proofs
DROP POLICY IF EXISTS "Authenticated users can view proofs" ON proofs;
DROP POLICY IF EXISTS "Unified proofs insert access" ON proofs;
DROP POLICY IF EXISTS "Unified proofs update access" ON proofs;
DROP POLICY IF EXISTS "Unified proofs delete access" ON proofs;

-- Lecture proofs: staff autorisé via client assigné OU admin/manager
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

-- Écriture proofs: staff autorisé
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

-- Supprimer les anciennes policies commentaires
DROP POLICY IF EXISTS "Authenticated users can manage proof comments" ON epreuve_commentaires;

-- Lecture commentaires: même logique que proofs
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

-- Écriture commentaires: staff + clients via tokens edge functions
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

-- 🔐 SÉCURISATION GÉNÉRALE - Révocation large
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- Sécurisation des tables sensibles supplémentaires
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;