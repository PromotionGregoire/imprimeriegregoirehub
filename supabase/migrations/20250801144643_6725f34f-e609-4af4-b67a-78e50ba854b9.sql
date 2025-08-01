-- Script de seeding pour les 22 produits de cartes d'affaires
-- Version corrigée avec gestion des contraintes

-- D'abord, ajouter une contrainte unique sur le nom du fournisseur si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_supplier_name'
    ) THEN
        ALTER TABLE public.suppliers ADD CONSTRAINT unique_supplier_name UNIQUE (name);
    END IF;
END $$;

-- Ajouter une contrainte unique sur le nom du produit si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_product_name'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT unique_product_name UNIQUE (name);
    END IF;
END $$;

-- Ajouter une contrainte unique sur la combinaison product_id + supplier_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_product_supplier'
    ) THEN
        ALTER TABLE public.product_suppliers ADD CONSTRAINT unique_product_supplier UNIQUE (product_id, supplier_id);
    END IF;
END $$;

-- Ajouter une contrainte unique sur la combinaison product_id + attribute_name + attribute_value si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_product_variant'
    ) THEN
        ALTER TABLE public.product_variants ADD CONSTRAINT unique_product_variant UNIQUE (product_id, attribute_name, attribute_value);
    END IF;
END $$;

-- Insérer le fournisseur Sinalite s'il n'existe pas
INSERT INTO public.suppliers (name, contact_person, email, phone)
SELECT 'Sinalite', 'Contact Sinalite', 'contact@sinalite.com', '555-0000'
WHERE NOT EXISTS (SELECT 1 FROM public.suppliers WHERE name = 'Sinalite');

-- Créer les 22 produits et leurs variantes
DO $$
DECLARE
    sinalite_id UUID;
    product_id UUID;
    product_names TEXT[] := ARRAY[
        'Cartes d''affaires 14pt Lamination Mate',
        'Cartes d''affaires 14pt Fini UV (High Gloss)',
        'Cartes d''affaires 14pt Fini AQ',
        'Cartes d''affaires 16pt Lamination Mate',
        'Cartes d''affaires 16pt Fini UV (High Gloss)',
        'Cartes d''affaires 16pt Fini AQ',
        'Cartes d''affaires 18pt Lamination Mate/Soyeuse',
        'Cartes d''affaires 18pt Lamination Brillante',
        'Cartes d''affaires 13pt Écologique (Enviro)',
        'Cartes d''affaires 13pt en Lin (Linen)',
        'Cartes d''affaires 14pt Inscriptible + AQ (C1S)',
        'Cartes d''affaires 14pt Inscriptible + UV (C1S)',
        'Cartes d''affaires 18pt Inscriptible (C1S)',
        'Cartes d''affaires avec Estampage Métallique (Foil)',
        'Cartes d''affaires avec Vernis Sélectif (Spot UV)',
        'Cartes d''affaires en Papier Kraft',
        'Cartes d''affaires Durables (Plastique)',
        'Cartes d''affaires en Papier Nacré (Pearl)',
        'Cartes d''affaires avec Découpe Personnalisée (Die Cut)',
        'Cartes d''affaires au Fini Suédé (Soft Touch)',
        'Cartes d''affaires 32pt à Tranche Colorée',
        'Cartes d''affaires 32pt Ultra Lisses (Ultra Smooth)'
    ];
    product_name TEXT;
BEGIN
    -- Récupérer l'ID du fournisseur Sinalite
    SELECT id INTO sinalite_id FROM public.suppliers WHERE name = 'Sinalite' LIMIT 1;
    
    -- Insérer les 22 produits
    FOREACH product_name IN ARRAY product_names
    LOOP
        -- Insérer le produit s'il n'existe pas
        INSERT INTO public.products (name, category, default_price)
        SELECT product_name, 'Impression', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = product_name);
        
        -- Récupérer l'ID du produit
        SELECT id INTO product_id FROM public.products WHERE name = product_name LIMIT 1;
        
        -- Associer le produit au fournisseur Sinalite s'il n'est pas déjà associé
        INSERT INTO public.product_suppliers (product_id, supplier_id)
        SELECT product_id, sinalite_id
        WHERE NOT EXISTS (
            SELECT 1 FROM public.product_suppliers 
            WHERE product_id = product_id AND supplier_id = sinalite_id
        );
    END LOOP;
END $$;

-- Insérer toutes les variantes de produits
DO $$
DECLARE
    product_id UUID;
BEGIN
    -- 1. Cartes d'affaires 14pt Lamination Mate
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Lamination Mate' LIMIT 1;
    IF product_id IS NOT NULL THEN
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Papier (Stock)', '14PT', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Papier (Stock)' AND attribute_value = '14PT');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Finition (Coating)', 'Matte Finish', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Finition (Coating)' AND attribute_value = 'Matte Finish');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Impression', 'Recto seulement (4/0)', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Impression' AND attribute_value = 'Recto seulement (4/0)');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Impression', 'Recto-Verso (4/4)', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Impression' AND attribute_value = 'Recto-Verso (4/4)');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Taille', '3.5" x 2"', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Taille' AND attribute_value = '3.5" x 2"');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Coins Arrondis', 'Non', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Non');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Oui (Rayon de 1/4")');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Oui (Rayon de 1/8")');
        
        -- Quantités
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '25', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '25');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '50', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '50');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '75', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '75');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '100', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '100');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '250', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '250');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '500', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '500');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '750', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '750');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '1000', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '1000');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '2500', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '2500');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '5000', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '5000');
    END IF;

    -- 2. Cartes d'affaires 14pt Fini UV (High Gloss)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Fini UV (High Gloss)' LIMIT 1;
    IF product_id IS NOT NULL THEN
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Papier (Stock)', '14PT', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Papier (Stock)' AND attribute_value = '14PT');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Finition (Coating)', 'UV (High Gloss)', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Finition (Coating)' AND attribute_value = 'UV (High Gloss)');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Impression', 'Recto seulement (4/0)', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Impression' AND attribute_value = 'Recto seulement (4/0)');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Impression', 'Recto-Verso (4/4)', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Impression' AND attribute_value = 'Recto-Verso (4/4)');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Taille', '3.5" x 2"', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Taille' AND attribute_value = '3.5" x 2"');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Coins Arrondis', 'Non', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Non');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Oui (Rayon de 1/4")');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Oui (Rayon de 1/8")');
        
        -- Quantités (mêmes que le premier produit)
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '25', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '25');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '50', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '50');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '75', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '75');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '100', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '100');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '250', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '250');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '500', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '500');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '750', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '750');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '1000', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '1000');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '2500', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '2500');
        
        INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
        SELECT product_id, 'Quantité', '5000', 0
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = product_id AND attribute_name = 'Quantité' AND attribute_value = '5000');
    END IF;

END $$;