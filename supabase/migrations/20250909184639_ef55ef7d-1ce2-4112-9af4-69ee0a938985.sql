-- Mise à jour de la contrainte CHECK pour inclure le statut "Marqué Facturé"

-- D'abord, supprimer l'ancienne contrainte si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_status_check' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_status_check;
    END IF;
END $$;

-- Ajouter la nouvelle contrainte avec tous les statuts valides
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
    'En attente de l''épreuve',
    'En production',
    'Marqué Facturé', 
    'Complétée'
));