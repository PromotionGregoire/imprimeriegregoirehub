-- Script de seeding pour les 22 produits de cartes d'affaires
-- Ce script est idempotent grâce à ON CONFLICT DO NOTHING

-- D'abord, s'assurer que le fournisseur Sinalite existe
INSERT INTO public.suppliers (name, contact_person, email, phone)
VALUES ('Sinalite', 'Contact Sinalite', 'contact@sinalite.com', '555-0000')
ON CONFLICT (name) DO NOTHING;

-- Variable pour stocker l'ID du fournisseur Sinalite
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
        INSERT INTO public.products (name, category, default_price)
        VALUES (product_name, 'Impression', 0)
        ON CONFLICT (name) DO NOTHING;
        
        -- Récupérer l'ID du produit qui vient d'être inséré ou qui existait déjà
        SELECT id INTO product_id FROM public.products WHERE name = product_name LIMIT 1;
        
        -- Associer le produit au fournisseur Sinalite
        INSERT INTO public.product_suppliers (product_id, supplier_id)
        VALUES (product_id, sinalite_id)
        ON CONFLICT (product_id, supplier_id) DO NOTHING;
    END LOOP;
END $$;

-- Insérer les variantes pour chaque produit
DO $$
DECLARE
    product_id UUID;
BEGIN
    -- 1. Cartes d'affaires 14pt Lamination Mate
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Lamination Mate' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '14PT', 0),
    (product_id, 'Finition (Coating)', 'Matte Finish', 0),
    (product_id, 'Impression', 'Recto seulement (4/0)', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '25', 0),
    (product_id, 'Quantité', '50', 0),
    (product_id, 'Quantité', '75', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '750', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 2. Cartes d'affaires 14pt Fini UV (High Gloss)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Fini UV (High Gloss)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '14PT', 0),
    (product_id, 'Finition (Coating)', 'UV (High Gloss)', 0),
    (product_id, 'Impression', 'Recto seulement (4/0)', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '25', 0),
    (product_id, 'Quantité', '50', 0),
    (product_id, 'Quantité', '75', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '750', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 3. Cartes d'affaires 14pt Fini AQ
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Fini AQ' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '14PT', 0),
    (product_id, 'Finition (Coating)', 'AQ (Aqueous Coating)', 0),
    (product_id, 'Impression', 'Recto seulement (4/0)', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '25', 0),
    (product_id, 'Quantité', '50', 0),
    (product_id, 'Quantité', '75', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '750', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 4. Cartes d'affaires 16pt Lamination Mate
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 16pt Lamination Mate' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '16PT', 0),
    (product_id, 'Finition (Coating)', 'Matte Finish', 0),
    (product_id, 'Impression', 'Recto seulement (4/0)', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '25', 0),
    (product_id, 'Quantité', '50', 0),
    (product_id, 'Quantité', '75', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '750', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 5. Cartes d'affaires 16pt Fini UV (High Gloss)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 16pt Fini UV (High Gloss)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '16PT', 0),
    (product_id, 'Finition (Coating)', 'UV (High Gloss)', 0),
    (product_id, 'Impression', 'Recto seulement (4/0)', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '25', 0),
    (product_id, 'Quantité', '50', 0),
    (product_id, 'Quantité', '75', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '750', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 6. Cartes d'affaires 16pt Fini AQ
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 16pt Fini AQ' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '16PT', 0),
    (product_id, 'Finition (Coating)', 'AQ (Aqueous Coating)', 0),
    (product_id, 'Impression', 'Recto seulement (4/0)', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '25', 0),
    (product_id, 'Quantité', '50', 0),
    (product_id, 'Quantité', '75', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '750', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 7. Cartes d'affaires 18pt Lamination Mate/Soyeuse
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 18pt Lamination Mate/Soyeuse' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '18PT', 0),
    (product_id, 'Finition (Coating)', 'Matte / Silk Lamination', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 8. Cartes d'affaires 18pt Lamination Brillante
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 18pt Lamination Brillante' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '18PT', 0),
    (product_id, 'Finition (Coating)', 'Gloss Lamination', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 9. Cartes d'affaires 13pt Écologique (Enviro)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 13pt Écologique (Enviro)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '13pt Enviro Uncoated', 0),
    (product_id, 'Impression', 'Recto seulement (4/0)', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 10. Cartes d'affaires 13pt en Lin (Linen)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 13pt en Lin (Linen)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '13pt Linen Uncoated', 0),
    (product_id, 'Impression', 'Recto seulement (4/0)', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 11. Cartes d'affaires 14pt Inscriptible + AQ (C1S)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Inscriptible + AQ (C1S)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '14PT Coated One Side (C1S)', 0),
    (product_id, 'Finition (Coating)', 'Côté 1: AQ / Côté 2: Uncoated', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 12. Cartes d'affaires 14pt Inscriptible + UV (C1S)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 14pt Inscriptible + UV (C1S)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '14PT Coated One Side (C1S)', 0),
    (product_id, 'Finition (Coating)', 'Côté 1: UV / Côté 2: Uncoated', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 13. Cartes d'affaires 18pt Inscriptible (C1S)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 18pt Inscriptible (C1S)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '18PT Coated One Side (C1S)', 0),
    (product_id, 'Finition (Coating)', 'Côté 1: Uncoated / Côté 2: Uncoated', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 14. Cartes d'affaires avec Estampage Métallique (Foil)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires avec Estampage Métallique (Foil)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier de base', '22PT Soft Touch (Suede)', 0),
    (product_id, 'Couleur du Foil', 'Or', 0),
    (product_id, 'Couleur du Foil', 'Argent', 0),
    (product_id, 'Couleur du Foil', 'Cuivre', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 15. Cartes d'affaires avec Vernis Sélectif (Spot UV)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires avec Vernis Sélectif (Spot UV)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier de base', '22PT Soft Touch (Suede)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 16. Cartes d'affaires en Papier Kraft
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires en Papier Kraft' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '18PT Kraft Uncoated', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 17. Cartes d'affaires Durables (Plastique)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires Durables (Plastique)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Matériel', 'Plastique 20PT', 0),
    (product_id, 'Type de Plastique', 'Blanc Opaque', 0),
    (product_id, 'Type de Plastique', 'Clair (Transparent)', 0),
    (product_id, 'Type de Plastique', 'Givré (Frosted)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0),
    (product_id, 'Quantité', '2500', 0),
    (product_id, 'Quantité', '5000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 18. Cartes d'affaires en Papier Nacré (Pearl)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires en Papier Nacré (Pearl)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '14PT Pearl Metallic', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 19. Cartes d'affaires avec Découpe Personnalisée (Die Cut)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires avec Découpe Personnalisée (Die Cut)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier de base', '14PT + UV (High Gloss)', 0),
    (product_id, 'Complexité de la forme', 'Simple', 0),
    (product_id, 'Complexité de la forme', 'Complexe', 0),
    (product_id, 'Taille Maximale', '3.5" x 2"', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 20. Cartes d'affaires au Fini Suédé (Soft Touch)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires au Fini Suédé (Soft Touch)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '22PT Soft Touch (Suede)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Coins Arrondis', 'Non', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/4")', 0),
    (product_id, 'Coins Arrondis', 'Oui (Rayon de 1/8")', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 21. Cartes d'affaires 32pt à Tranche Colorée
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 32pt à Tranche Colorée' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '32pt Uncoated (Ultra Smooth)', 0),
    (product_id, 'Couleur de la tranche', 'Noir', 0),
    (product_id, 'Couleur de la tranche', 'Bleu', 0),
    (product_id, 'Couleur de la tranche', 'Marron', 0),
    (product_id, 'Couleur de la tranche', 'Rose', 0),
    (product_id, 'Couleur de la tranche', 'Orange', 0),
    (product_id, 'Couleur de la tranche', 'Violet', 0),
    (product_id, 'Couleur de la tranche', 'Rouge', 0),
    (product_id, 'Couleur de la tranche', 'Turquoise', 0),
    (product_id, 'Couleur de la tranche', 'Jaune', 0),
    (product_id, 'Couleur de la tranche', 'Blanc', 0),
    (product_id, 'Couleur de la tranche', 'Or Métallique', 0),
    (product_id, 'Couleur de la tranche', 'Argent Métallique', 0),
    (product_id, 'Couleur de la tranche', 'Cuivre Métallique', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

    -- 22. Cartes d'affaires 32pt Ultra Lisses (Ultra Smooth)
    SELECT id INTO product_id FROM public.products WHERE name = 'Cartes d''affaires 32pt Ultra Lisses (Ultra Smooth)' LIMIT 1;
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, price) VALUES
    (product_id, 'Papier (Stock)', '32pt Uncoated', 0),
    (product_id, 'Impression', 'Recto-Verso (4/4)', 0),
    (product_id, 'Taille', '3.5" x 2"', 0),
    (product_id, 'Quantité', '100', 0),
    (product_id, 'Quantité', '250', 0),
    (product_id, 'Quantité', '500', 0),
    (product_id, 'Quantité', '1000', 0)
    ON CONFLICT (product_id, attribute_name, attribute_value) DO NOTHING;

END $$;