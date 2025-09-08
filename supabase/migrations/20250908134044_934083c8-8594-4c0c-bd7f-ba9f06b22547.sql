-- Correction des problèmes de sécurité détectés

-- 1. Correction des fonctions sans search_path défini
CREATE OR REPLACE FUNCTION gen_invoice_number() RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE y TEXT := to_char(now(),'YYYY');
BEGIN
  RETURN 'FAC-'||y||'-'||lpad(nextval('seq_invoice_no')::TEXT,4,'0');
END; $$;

CREATE OR REPLACE FUNCTION invoices_set_defaults() RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
END; $$;

CREATE OR REPLACE FUNCTION after_payment_update_invoice() RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE invoices SET updated_at = now()
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END; $$;

-- 2. Activer RLS sur les tables manquantes identifiées par le linter
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_members_via_project ON project_members FOR ALL USING (
  EXISTS(
    SELECT 1 FROM projects p 
    WHERE p.id = project_members.project_id 
    AND (
      EXISTS(SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role IN ('ADMIN','MANAGER')) OR
      p.manager_id = auth.uid() OR
      project_members.profile_id = auth.uid()
    )
  )
) WITH CHECK (
  EXISTS(
    SELECT 1 FROM projects p 
    WHERE p.id = project_members.project_id 
    AND (
      EXISTS(SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role IN ('ADMIN','MANAGER')) OR
      p.manager_id = auth.uid()
    )
  )
);

ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_files_via_project ON project_files FOR ALL USING (
  EXISTS(
    SELECT 1 FROM projects p 
    WHERE p.id = project_files.project_id 
    AND (
      EXISTS(SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role IN ('ADMIN','MANAGER')) OR
      p.manager_id = auth.uid() OR
      EXISTS(SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.profile_id = auth.uid())
    )
  )
) WITH CHECK (
  EXISTS(
    SELECT 1 FROM projects p 
    WHERE p.id = project_files.project_id 
    AND (
      EXISTS(SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role IN ('ADMIN','MANAGER')) OR
      p.manager_id = auth.uid() OR
      EXISTS(SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.profile_id = auth.uid())
    )
  )
);

ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY price_list_items_all_read ON price_list_items FOR SELECT USING (true);
CREATE POLICY price_list_items_admin_write ON price_list_items FOR ALL USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
) WITH CHECK (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));