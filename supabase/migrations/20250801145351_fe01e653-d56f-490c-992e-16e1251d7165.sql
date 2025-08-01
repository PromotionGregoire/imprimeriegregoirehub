-- Continuer avec les 20 autres produits de cartes d'affaires
DO $$
DECLARE
    sinalite_id UUID;
    current_product_id UUID;
BEGIN
    -- Récupérer l'ID du fournisseur Sinalite
    SELECT id INTO sinalite_id FROM public.suppliers WHERE name = 'Sinalite' LIMIT 1;
    
    -- 3. Cartes d'affaires 14pt Fini AQ
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 14pt Fini AQ', 'Impression', 0, 'CAR-IMP-003'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 14pt Fini AQ');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Fini AQ' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (SELECT 1 FROM public.product_suppliers WHERE product_id = current_product_id AND supplier_id = sinalite_id);
    
    -- Variantes 14pt AQ
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, attr_name, attr_value, 0
    FROM (VALUES 
        ('Papier (Stock)', '14PT'),
        ('Finition (Coating)', 'AQ (Aqueous Coating)'),
        ('Impression', 'Recto seulement (4/0)'),
        ('Impression', 'Recto-Verso (4/4)'),
        ('Taille', '3.5" x 2"'),
        ('Coins Arrondis', 'Non'),
        ('Coins Arrondis', 'Oui (Rayon de 1/4")'),
        ('Coins Arrondis', 'Oui (Rayon de 1/8")'),
        ('Quantité', '25'), ('Quantité', '50'), ('Quantité', '75'), ('Quantité', '100'),
        ('Quantité', '250'), ('Quantité', '500'), ('Quantité', '750'), ('Quantité', '1000'),
        ('Quantité', '2500'), ('Quantité', '5000')
    ) AS variants(attr_name, attr_value)
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = attr_name AND attribute_value = attr_value);

    -- 4. Cartes d'affaires 16pt Lamination Mate
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 16pt Lamination Mate', 'Impression', 0, 'CAR-IMP-004'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 16pt Lamination Mate');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 16pt Lamination Mate' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (SELECT 1 FROM public.product_suppliers WHERE product_id = current_product_id AND supplier_id = sinalite_id);
    
    -- Variantes 16pt Mate
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, attr_name, attr_value, 0
    FROM (VALUES 
        ('Papier (Stock)', '16PT'),
        ('Finition (Coating)', 'Matte Finish'),
        ('Impression', 'Recto seulement (4/0)'),
        ('Impression', 'Recto-Verso (4/4)'),
        ('Taille', '3.5" x 2"'),
        ('Coins Arrondis', 'Non'),
        ('Coins Arrondis', 'Oui (Rayon de 1/4")'),
        ('Coins Arrondis', 'Oui (Rayon de 1/8")'),
        ('Quantité', '25'), ('Quantité', '50'), ('Quantité', '75'), ('Quantité', '100'),
        ('Quantité', '250'), ('Quantité', '500'), ('Quantité', '750'), ('Quantité', '1000'),
        ('Quantité', '2500'), ('Quantité', '5000')
    ) AS variants(attr_name, attr_value)
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = attr_name AND attribute_value = attr_value);

    -- 5. Cartes d'affaires 16pt Fini UV (High Gloss)
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 16pt Fini UV (High Gloss)', 'Impression', 0, 'CAR-IMP-005'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 16pt Fini UV (High Gloss)');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 16pt Fini UV (High Gloss)' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (SELECT 1 FROM public.product_suppliers WHERE product_id = current_product_id AND supplier_id = sinalite_id);
    
    -- Variantes 16pt UV
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, attr_name, attr_value, 0
    FROM (VALUES 
        ('Papier (Stock)', '16PT'),
        ('Finition (Coating)', 'UV (High Gloss)'),
        ('Impression', 'Recto seulement (4/0)'),
        ('Impression', 'Recto-Verso (4/4)'),
        ('Taille', '3.5" x 2"'),
        ('Coins Arrondis', 'Non'),
        ('Coins Arrondis', 'Oui (Rayon de 1/4")'),
        ('Coins Arrondis', 'Oui (Rayon de 1/8")'),
        ('Quantité', '25'), ('Quantité', '50'), ('Quantité', '75'), ('Quantité', '100'),
        ('Quantité', '250'), ('Quantité', '500'), ('Quantité', '750'), ('Quantité', '1000'),
        ('Quantité', '2500'), ('Quantité', '5000')
    ) AS variants(attr_name, attr_value)
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = attr_name AND attribute_value = attr_value);

    -- 6. Cartes d'affaires 16pt Fini AQ
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 16pt Fini AQ', 'Impression', 0, 'CAR-IMP-006'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 16pt Fini AQ');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 16pt Fini AQ' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (SELECT 1 FROM public.product_suppliers WHERE product_id = current_product_id AND supplier_id = sinalite_id);
    
    -- Variantes 16pt AQ
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, attr_name, attr_value, 0
    FROM (VALUES 
        ('Papier (Stock)', '16PT'),
        ('Finition (Coating)', 'AQ (Aqueous Coating)'),
        ('Impression', 'Recto seulement (4/0)'),
        ('Impression', 'Recto-Verso (4/4)'),
        ('Taille', '3.5" x 2"'),
        ('Coins Arrondis', 'Non'),
        ('Coins Arrondis', 'Oui (Rayon de 1/4")'),
        ('Coins Arrondis', 'Oui (Rayon de 1/8")'),
        ('Quantité', '25'), ('Quantité', '50'), ('Quantité', '75'), ('Quantité', '100'),
        ('Quantité', '250'), ('Quantité', '500'), ('Quantité', '750'), ('Quantité', '1000'),
        ('Quantité', '2500'), ('Quantité', '5000')
    ) AS variants(attr_name, attr_value)
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = attr_name AND attribute_value = attr_value);

    -- 7. Cartes d'affaires 18pt Lamination Mate/Soyeuse
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 18pt Lamination Mate/Soyeuse', 'Impression', 0, 'CAR-IMP-007'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 18pt Lamination Mate/Soyeuse');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 18pt Lamination Mate/Soyeuse' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (SELECT 1 FROM public.product_suppliers WHERE product_id = current_product_id AND supplier_id = sinalite_id);
    
    -- Variantes 18pt Mate/Soyeuse
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, attr_name, attr_value, 0
    FROM (VALUES 
        ('Papier (Stock)', '18PT'),
        ('Finition (Coating)', 'Matte / Silk Lamination'),
        ('Impression', 'Recto-Verso (4/4)'),
        ('Taille', '3.5" x 2"'),
        ('Coins Arrondis', 'Non'),
        ('Coins Arrondis', 'Oui (Rayon de 1/4")'),
        ('Coins Arrondis', 'Oui (Rayon de 1/8")'),
        ('Quantité', '100'), ('Quantité', '250'), ('Quantité', '500'), ('Quantité', '1000')
    ) AS variants(attr_name, attr_value)
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = attr_name AND attribute_value = attr_value);

    -- 8. Cartes d'affaires 18pt Lamination Brillante
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 18pt Lamination Brillante', 'Impression', 0, 'CAR-IMP-008'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 18pt Lamination Brillante');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 18pt Lamination Brillante' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (SELECT 1 FROM public.product_suppliers WHERE product_id = current_product_id AND supplier_id = sinalite_id);
    
    -- Variantes 18pt Brillante
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, attr_name, attr_value, 0
    FROM (VALUES 
        ('Papier (Stock)', '18PT'),
        ('Finition (Coating)', 'Gloss Lamination'),
        ('Impression', 'Recto-Verso (4/4)'),
        ('Taille', '3.5" x 2"'),
        ('Coins Arrondis', 'Non'),
        ('Coins Arrondis', 'Oui (Rayon de 1/4")'),
        ('Coins Arrondis', 'Oui (Rayon de 1/8")'),
        ('Quantité', '100'), ('Quantité', '250'), ('Quantité', '500'), ('Quantité', '1000')
    ) AS variants(attr_name, attr_value)
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = attr_name AND attribute_value = attr_value);

    -- 9. Cartes d'affaires 13pt Écologique (Enviro)
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 13pt Écologique (Enviro)', 'Impression', 0, 'CAR-IMP-009'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 13pt Écologique (Enviro)');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 13pt Écologique (Enviro)' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (SELECT 1 FROM public.product_suppliers WHERE product_id = current_product_id AND supplier_id = sinalite_id);
    
    -- Variantes 13pt Écologique
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, attr_name, attr_value, 0
    FROM (VALUES 
        ('Papier (Stock)', '13pt Enviro Uncoated'),
        ('Impression', 'Recto seulement (4/0)'),
        ('Impression', 'Recto-Verso (4/4)'),
        ('Taille', '3.5" x 2"'),
        ('Coins Arrondis', 'Non'),
        ('Coins Arrondis', 'Oui (Rayon de 1/4")'),
        ('Coins Arrondis', 'Oui (Rayon de 1/8")'),
        ('Quantité', '100'), ('Quantité', '250'), ('Quantité', '500'), ('Quantité', '1000')
    ) AS variants(attr_name, attr_value)
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = attr_name AND attribute_value = attr_value);

    -- 10. Cartes d'affaires 13pt en Lin (Linen)
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 13pt en Lin (Linen)', 'Impression', 0, 'CAR-IMP-010'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 13pt en Lin (Linen)');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 13pt en Lin (Linen)' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (SELECT 1 FROM public.product_suppliers WHERE product_id = current_product_id AND supplier_id = sinalite_id);
    
    -- Variantes 13pt Lin
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, attr_name, attr_value, 0
    FROM (VALUES 
        ('Papier (Stock)', '13pt Linen Uncoated'),
        ('Impression', 'Recto seulement (4/0)'),
        ('Impression', 'Recto-Verso (4/4)'),
        ('Taille', '3.5" x 2"'),
        ('Coins Arrondis', 'Non'),
        ('Coins Arrondis', 'Oui (Rayon de 1/4")'),
        ('Coins Arrondis', 'Oui (Rayon de 1/8")'),
        ('Quantité', '100'), ('Quantité', '250'), ('Quantité', '500'), ('Quantité', '1000')
    ) AS variants(attr_name, attr_value)
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = attr_name AND attribute_value = attr_value);

    -- 11. Cartes d'affaires 14pt Inscriptible + AQ (C1S)
    INSERT INTO public.products (name, category, default_price, product_code)
    SELECT 'Cartes d''affaires 14pt Inscriptible + AQ (C1S)', 'Impression', 0, 'CAR-IMP-011'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Cartes d''affaires 14pt Inscriptible + AQ (C1S)');
    
    SELECT id INTO current_product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Inscriptible + AQ (C1S)' LIMIT 1;
    
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    SELECT current_product_id, sinalite_id
    WHERE NOT EXISTS (SELECT 1 FROM public.product_suppliers WHERE product_id = current_product_id AND supplier_id = sinalite_id);
    
    -- Variantes 14pt C1S AQ
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) 
    SELECT current_product_id, attr_name, attr_value, 0
    FROM (VALUES 
        ('Papier (Stock)', '14PT Coated One Side (C1S)'),
        ('Finition (Coating)', 'Côté 1: AQ / Côté 2: Uncoated'),
        ('Impression', 'Recto-Verso (4/4)'),
        ('Taille', '3.5" x 2"'),
        ('Quantité', '100'), ('Quantité', '250'), ('Quantité', '500'), 
        ('Quantité', '1000'), ('Quantité', '2500'), ('Quantité', '5000')
    ) AS variants(attr_name, attr_value)
    WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = current_product_id AND attribute_name = attr_name AND attribute_value = attr_value);

END $$;