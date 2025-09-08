-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions; -- optionnel (rappels/overdue)

-- Unifier les policies en minuscules (exemples)
DROP POLICY IF EXISTS project_members_via_project ON project_members;
CREATE POLICY project_members_via_project ON project_members FOR ALL
  USING (
    EXISTS(
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
        AND (
          EXISTS(SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role IN ('admin','manager'))
          OR p.manager_id = auth.uid()
          OR project_members.profile_id = auth.uid()
        )
    )
  )
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
        AND (
          EXISTS(SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role IN ('admin','manager'))
          OR p.manager_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS price_list_items_admin_write ON price_list_items;
CREATE POLICY price_list_items_admin_write ON price_list_items FOR ALL
  USING (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- RLS pour invoice_lines  
ALTER TABLE IF EXISTS invoice_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoice_lines_via_invoice ON invoice_lines;
CREATE POLICY invoice_lines_via_invoice ON invoice_lines FOR ALL
  USING (
    EXISTS(SELECT 1 FROM invoices i
           JOIN profiles p ON p.id = auth.uid()
           WHERE i.id = invoice_lines.invoice_id
             AND (p.role IN ('admin','manager')))
  );

-- Services et price_lists: lecture publique pour employés authentifiés
DROP POLICY IF EXISTS services_admin_write ON services;
CREATE POLICY services_admin_write ON services FOR ALL
  USING (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS services_all_read ON services;
CREATE POLICY services_all_read ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS price_lists_admin_write ON price_lists;
CREATE POLICY price_lists_admin_write ON price_lists FOR ALL
  USING (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS price_lists_all_read ON price_lists;
CREATE POLICY price_lists_all_read ON price_lists FOR SELECT USING (true);

-- Fonction pour marquer les factures en retard
CREATE OR REPLACE FUNCTION mark_invoices_overdue() 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE invoices
  SET status = 'overdue', updated_at = now()
  WHERE status IN ('sent','partial')
    AND due_at IS NOT NULL
    AND due_at < now()
    AND balance_due > 0;
END$$;

-- Tâche cron quotidienne à 02:00
SELECT cron.schedule('invoices-overdue-daily', '0 2 * * *', $$SELECT public.mark_invoices_overdue();$$);