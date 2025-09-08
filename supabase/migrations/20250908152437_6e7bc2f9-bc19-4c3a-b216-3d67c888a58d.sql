-- ===================================================
-- PATCH MINIMAL - Seulement la fonction payment
-- ===================================================

-- Corriger after_payment_update_invoice() pour gérer DELETE & changement invoice_id
CREATE OR REPLACE FUNCTION after_payment_update_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old uuid := NULL;
  v_new uuid := NULL;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new := NEW.invoice_id;
    UPDATE invoices SET updated_at = now() WHERE id = v_new;

  ELSIF TG_OP = 'UPDATE' THEN
    v_old := OLD.invoice_id;
    v_new := NEW.invoice_id;
    IF v_old IS DISTINCT FROM v_new THEN
      UPDATE invoices SET updated_at = now() WHERE id IN (v_old, v_new);
    ELSE
      UPDATE invoices SET updated_at = now() WHERE id = v_new;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    v_old := OLD.invoice_id;
    UPDATE invoices SET updated_at = now() WHERE id = v_old;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;