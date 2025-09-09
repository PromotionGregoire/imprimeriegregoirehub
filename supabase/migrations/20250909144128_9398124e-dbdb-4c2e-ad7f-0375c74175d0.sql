-- Backfill: emails en minuscules
UPDATE public.clients
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL
  AND email <> LOWER(TRIM(email));

-- Contrainte: forcer minuscule côté BD (si pas déjà géré côté app)
CREATE OR REPLACE FUNCTION public.enforce_lowercase_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email := LOWER(TRIM(NEW.email));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clients_lower_email ON public.clients;
CREATE TRIGGER trg_clients_lower_email
BEFORE INSERT OR UPDATE OF email ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.enforce_lowercase_email();