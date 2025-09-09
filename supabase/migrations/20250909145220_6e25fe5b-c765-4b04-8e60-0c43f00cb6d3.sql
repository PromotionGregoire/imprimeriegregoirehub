-- Unicité des emails (insensible à la casse), en ignorant les NULL
CREATE UNIQUE INDEX IF NOT EXISTS clients_email_lower_unique
ON public.clients ((LOWER(email)))
WHERE email IS NOT NULL;

-- Vérification de format email côté BD
ALTER TABLE public.clients
  ADD CONSTRAINT clients_email_format_chk
  CHECK (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Vérifier les contraintes existantes sur orders.status
-- et normaliser quelques variantes de statuts si nécessaire
UPDATE public.orders
SET status = 'Épreuve acceptée'
WHERE status IN ('Epreuve acceptée','Épreuve acceptee','Epreuve acceptee');

UPDATE public.orders
SET status = 'Épreuve – modifications demandées'
WHERE status IN ('Épreuve - modifications demandées','Epreuve – modifications demandées');

-- Vérifier si la contrainte orders_status_check existe et la recréer si nécessaire
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM   pg_constraint c
    JOIN   pg_class t ON t.oid = c.conrelid
    JOIN   pg_namespace n ON n.oid = t.relnamespace
    WHERE  n.nspname = 'public'
    AND    t.relname = 'orders'
    AND    c.conname = 'orders_status_check'
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
  END IF;
END$$;

-- Recréer avec l'ensemble des statuts autorisés
ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'Nouveau',
    'En préparation', 
    'En attente de l''épreuve',
    'Envoyée au client',
    'Épreuve – modifications demandées',
    'Épreuve acceptée',
    'En production',
    'Complétée',
    'Annulée'
  )
);