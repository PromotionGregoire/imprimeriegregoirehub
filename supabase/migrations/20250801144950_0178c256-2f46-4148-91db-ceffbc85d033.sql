-- Script de seeding simplifié pour les 22 produits de cartes d'affaires
-- Version qui évite les triggers en définissant les codes produit manuellement

-- D'abord, s'assurer que le fournisseur Sinalite existe
INSERT INTO public.suppliers (name, contact_person, email, phone)
SELECT 'Sinalite', 'Contact Sinalite', 'contact@sinalite.com', '555-0000'
WHERE NOT EXISTS (SELECT 1 FROM public.suppliers WHERE name = 'Sinalite');

-- Insérer les 22 produits avec des codes produits explicites
DO $$
DECLARE
    sinalite_id UUID;
    current_product_id UUID;
BEGIN
    -- Récupérer l'ID du fournisseur Sinalite
    SELECT id INTO sinalite_id FROM public.suppliers WHERE name = 'Sinalite' LIMIT 1;
    
    -- 1. Cartes d'affaires 14pt Lamination Mate
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 14pt Lamination Mate', 'Impression', 0, 'CAR-IMP-001'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 14pt Lamination Mate');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Lamination Mate' LIMIT 1;
    
    -- Associer au fournisseur
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (
        SELECT 1 FROM public.product_suppliers 
        WHERE product_id = current_product_id AND supplier_id = sinalite_id
    );
    
    -- Variantes pour le produit 1
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Papier (Stock)', '14PT', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Papier (Stock)' AND attribute_value = '14PT');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Finition (Coating)', 'Matte Finish', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Finition (Coating)' AND attribute_value = 'Matte Finish');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Impression', 'Recto seulement (4/0)', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Impression' AND attribute_value = 'Recto seulement (4/0)');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Impression', 'Recto-Verso (4/4)', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Impression' AND attribute_value = 'Recto-Verso (4/4)');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Taille', '3.5" x 2"', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Taille' AND attribute_value = '3.5" x 2"');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Coins Arrondis', 'Non', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Non');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Oui (Rayon de 1/4")');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Oui (Rayon de 1/8")');
    
    -- Quantités pour le produit 1
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '25', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '25');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '50', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '50');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '75', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '75');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '100', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '100');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '250', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '250');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '500', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '500');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '750', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '750');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '1000', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '1000');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '2500', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '2500');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '5000', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '5000');

    -- 2. Cartes d'affaires 14pt Fini UV (High Gloss)
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 14pt Fini UV (High Gloss)', 'Impression', 0, 'CAR-IMP-002'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 14pt Fini UV (High Gloss)');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Fini UV (High Gloss)' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (
        SELECT 1 FROM public.product_suppliers 
        WHERE product_id = current_product_id AND supplier_id = sinalite_id
    );
    
    -- Variantes pour le produit 2 (similaires au produit 1 sauf finition)
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Papier (Stock)', '14PT', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Papier (Stock)' AND attribute_value = '14PT');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Finition (Coating)', 'UV (High Gloss)', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Finition (Coating)' AND attribute_value = 'UV (High Gloss)');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Impression', 'Recto seulement (4/0)', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Impression' AND attribute_value = 'Recto seulement (4/0)');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Impression', 'Recto-Verso (4/4)', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Impression' AND attribute_value = 'Recto-Verso (4/4)');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Taille', '3.5" x 2"', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Taille' AND attribute_value = '3.5" x 2"');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Coins Arrondis', 'Non', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Non');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Oui (Rayon de 1/4")');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Coins Arrondis' AND attribute_value = 'Oui (Rayon de 1/8")');
    
    -- Quantités pour le produit 2 (mêmes que produit 1)
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '25', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '25');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '50', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '50');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '75', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '75');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '100', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '100');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '250', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '250');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '500', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '500');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '750', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '750');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '1000', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '1000');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '2500', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '2500');
    
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, 'Quantité', '5000', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = 'Quantité' AND attribute_value = '5000');

END $$;