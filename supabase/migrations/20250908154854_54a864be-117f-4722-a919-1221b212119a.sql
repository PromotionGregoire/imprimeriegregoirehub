-- Nettoyage complet des policies existantes avant sécurisation

-- PROFILES
DROP POLICY IF EXISTS "profiles_secure_read" ON profiles;
DROP POLICY IF EXISTS "profiles_secure_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_secure_update" ON profiles;
DROP POLICY IF EXISTS "profiles_secure_delete" ON profiles;

-- CLIENTS
DROP POLICY IF EXISTS "clients_secure_read" ON clients;
DROP POLICY IF EXISTS "clients_secure_insert" ON clients;
DROP POLICY IF EXISTS "clients_secure_update" ON clients;
DROP POLICY IF EXISTS "clients_secure_delete" ON clients;

-- SUPPLIERS
DROP POLICY IF EXISTS "suppliers_secure_read" ON suppliers;
DROP POLICY IF EXISTS "suppliers_secure_write" ON suppliers;

-- INVOICES
DROP POLICY IF EXISTS "invoices_secure_read" ON invoices;
DROP POLICY IF EXISTS "invoices_secure_write" ON invoices;

-- PAYMENTS
DROP POLICY IF EXISTS "payments_secure_read" ON payments;
DROP POLICY IF EXISTS "payments_secure_write" ON payments;

-- PROOFS
DROP POLICY IF EXISTS "proofs_secure_staff_read" ON proofs;
DROP POLICY IF EXISTS "proofs_secure_write" ON proofs;

-- COMMENTAIRES
DROP POLICY IF EXISTS "comments_secure_read" ON epreuve_commentaires;
DROP POLICY IF EXISTS "comments_secure_write" ON epreuve_commentaires;