-- Enums pour les nouveaux modules
CREATE TYPE invoice_status AS ENUM ('draft','sent','partial','paid','overdue','void');
CREATE TYPE payment_method AS ENUM ('card','ach','cash','check','wire','other');
CREATE TYPE project_status AS ENUM ('open','paused','completed','archived');

-- Séquences de numérotation
CREATE SEQUENCE seq_invoice_no;

-- Table invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  submission_id UUID REFERENCES submissions(id),
  order_id UUID REFERENCES orders(id),
  status invoice_status NOT NULL DEFAULT 'draft',
  currency TEXT NOT NULL DEFAULT 'CAD',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  taxes NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  issued_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table invoice_lines
CREATE TABLE IF NOT EXISTS invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  service_id UUID,
  label TEXT NOT NULL,
  qty NUMERIC(12,3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_codes TEXT[],
  total NUMERIC(12,2) GENERATED ALWAYS AS (qty * unit_price) STORED
);

-- Générateur de numéro FAC-YYYY-####
CREATE OR REPLACE FUNCTION gen_invoice_number() RETURNS TEXT AS $$
DECLARE y TEXT := to_char(now(),'YYYY');
BEGIN
  RETURN 'FAC-'||y||'-'||lpad(nextval('seq_invoice_no')::TEXT,4,'0');
END; $$ LANGUAGE plpgsql;

-- Trigger pour calculs automatiques factures
CREATE OR REPLACE FUNCTION invoices_set_defaults() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.number IS NULL THEN NEW.number := gen_invoice_number(); END IF;
  NEW.subtotal := COALESCE((SELECT sum(total) FROM invoice_lines WHERE invoice_id = NEW.id),0);
  NEW.taxes := COALESCE(NEW.taxes,0);
  NEW.total := NEW.subtotal + NEW.taxes;
  NEW.balance_due := GREATEST(NEW.total - COALESCE((SELECT sum(amount) FROM payments WHERE invoice_id = NEW.id),0),0);
  IF NEW.balance_due = 0 AND NEW.total > 0 THEN
    NEW.status := 'paid';
    IF NEW.paid_at IS NULL THEN NEW.paid_at := now(); END IF;
  ELSIF NEW.issued_at IS NOT NULL AND NEW.balance_due > 0 THEN
    IF NEW.status = 'draft' THEN NEW.status := 'sent'; END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_defaults_biu
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION invoices_set_defaults();

-- Table payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  method payment_method NOT NULL,
  reference TEXT,
  provider JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger après paiement pour recalcul facture
CREATE OR REPLACE FUNCTION after_payment_update_invoice() RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices SET updated_at = now()
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER payments_ai
AFTER INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION after_payment_update_invoice();

-- Table projects (projets dossiers client)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  manager_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'open',
  priority TEXT,
  start_date DATE,
  due_date DATE,
  budget NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT,
  PRIMARY KEY (project_id, profile_id)
);

CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  label TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tables HR de base
CREATE TABLE IF NOT EXISTS time_off_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  decided_by UUID REFERENCES profiles(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  work_date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL CHECK (hours > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Services et listes de prix
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'each',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CAD',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id UUID REFERENCES price_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  service_id UUID REFERENCES services(id),
  unit_price NUMERIC(12,2) NOT NULL,
  UNIQUE(price_list_id, product_id, service_id)
);

-- Vues et métriques
CREATE OR REPLACE VIEW dashboard_metrics_view AS
SELECT
  (SELECT count(*) FROM submissions WHERE status = 'pending') as pending_submissions,
  (SELECT count(*) FROM orders WHERE status IN ('in_production','quality_check','ready_for_delivery')) as active_orders,
  (SELECT count(*) FROM proofs WHERE status = 'pending') as pending_proofs;

CREATE OR REPLACE VIEW payments_last_30d AS
SELECT date_trunc('day', received_at) as day, sum(amount) total
FROM payments
WHERE received_at >= now() - interval '30 days'
GROUP BY 1 ORDER BY 1 ASC;

-- RLS pour nouvelles tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY inv_admin_manager_all ON invoices FOR ALL
  USING (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')));

CREATE POLICY inv_employee_own_clients ON invoices FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM submissions s
    WHERE s.id = invoices.submission_id AND s.client_id IN (
      SELECT client_id FROM submissions WHERE created_by = auth.uid()
    )
  )
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY pay_admin_manager ON payments FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
) WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY prj_admin_manager ON projects FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
) WITH CHECK (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER')));

CREATE POLICY prj_member_read ON projects FOR SELECT USING (
  EXISTS(SELECT 1 FROM project_members m WHERE m.project_id = projects.id AND m.profile_id = auth.uid())
);

ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY tor_owner_read_write ON time_off_requests FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY tor_owner_insert ON time_off_requests FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY tor_manager_moderate ON time_off_requests FOR UPDATE USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY ts_owner_crud ON timesheets FOR ALL USING (employee_id = auth.uid()) WITH CHECK (employee_id = auth.uid());
CREATE POLICY ts_manager_read ON timesheets FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
);

-- Enable RLS sur les autres nouvelles tables
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoice_lines_via_invoice ON invoice_lines FOR ALL USING (
  EXISTS(SELECT 1 FROM invoices i WHERE i.id = invoice_lines.invoice_id AND (
    EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','MANAGER'))
  ))
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY services_all_read ON services FOR SELECT USING (true);
CREATE POLICY services_admin_write ON services FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
) WITH CHECK (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY price_lists_all_read ON price_lists FOR SELECT USING (true);
CREATE POLICY price_lists_admin_write ON price_lists FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
) WITH CHECK (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));