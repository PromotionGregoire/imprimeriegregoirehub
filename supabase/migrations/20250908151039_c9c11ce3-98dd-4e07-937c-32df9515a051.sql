-- ===================================================
-- PATCH SQL - Corrections essentielles seulement
-- ===================================================

-- (A) Supprimer d'anciens triggers "create order on approved" si ils existent
DROP TRIGGER IF EXISTS create_order_on_approval ON submissions;
DROP FUNCTION IF EXISTS create_order_from_submission();

-- (B) Garantir un numéro de commande auto si absent
ALTER TABLE orders
  ALTER COLUMN order_number SET DEFAULT generate_order_number();

-- (C) Corriger le calcul des totaux dans invoices_set_defaults()
-- Recalculer depuis qty * unit_price au lieu de sum(total)
CREATE OR REPLACE FUNCTION invoices_set_defaults() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Générer le numéro si manquant
  IF NEW.number IS NULL THEN NEW.number := gen_invoice_number(); END IF;

  -- ✅ Calculer le sous-total depuis qty * unit_price
  NEW.subtotal := COALESCE(
    (SELECT SUM(qty * unit_price) FROM invoice_lines WHERE invoice_id = NEW.id),
    0
  );

  NEW.taxes := COALESCE(NEW.taxes, 0);
  NEW.total := NEW.subtotal + NEW.taxes;

  NEW.balance_due := GREATEST(
    NEW.total - COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = NEW.id), 0),
    0
  );

  IF NEW.balance_due = 0 AND NEW.total > 0 THEN
    NEW.status := 'paid';
    IF NEW.paid_at IS NULL THEN NEW.paid_at := now(); END IF;
  ELSIF NEW.issued_at IS NOT NULL AND NEW.balance_due > 0 THEN
    IF NEW.status = 'draft' THEN NEW.status := 'sent'; END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- (D) Rendre la génération du numéro explicite en DEFAULT pour invoices
ALTER TABLE invoices
  ALTER COLUMN number SET DEFAULT gen_invoice_number();

-- (E) S'assurer que les triggers existent pour invoices
DROP TRIGGER IF EXISTS trg_invoices_set_defaults ON invoices;
CREATE TRIGGER trg_invoices_set_defaults
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION invoices_set_defaults();

-- (F) S'assurer que le trigger pour payments existe aussi  
DROP TRIGGER IF EXISTS trg_after_payment_update_invoice ON payments;
CREATE TRIGGER trg_after_payment_update_invoice
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION after_payment_update_invoice();