-- Ajout du fournisseur Sinalite s'il n'existe pas déjà
INSERT INTO public.suppliers (name, email, contact_person, phone, website_1, is_goods_supplier, is_service_supplier)
VALUES ('Sinalite', 'info@sinalite.com', 'Service Client', '', 'https://sinalite.com', true, false)
ON CONFLICT DO NOTHING;

-- Variables pour stocker les IDs
DO $$
DECLARE
    sinalite_id uuid;
    standard_id uuid;
    premium_id uuid;
    plastic_id uuid;
    kraft_id uuid;
BEGIN
    -- Récupérer l'ID du fournisseur Sinalite
    SELECT id INTO sinalite_id FROM public.suppliers WHERE name = 'Sinalite' LIMIT 1;

    -- 1. Cartes d'affaires Standard
    INSERT INTO public.products (name, category, default_price, description)
    VALUES (
        'Cartes d''affaires Standard',
        'Cartes d''affaires',
        0.00,
        'Impression couleur de haute qualité sur une variété de cartons. Solution économique et populaire pour le réseautage professionnel. Idéal pour les grandes quantités.'
    ) RETURNING id INTO standard_id;

    -- Association avec le fournisseur
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    VALUES (standard_id, sinalite_id);

    -- Variantes pour Cartes Standard
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, cost_price) VALUES
    (standard_id, 'Papier', '14PT', 0),
    (standard_id, 'Papier', '16PT', 0),
    (standard_id, 'Finition', 'Matte', 0),
    (standard_id, 'Finition', 'UV (High Gloss)', 0),
    (standard_id, 'Coins', 'Carrés', 0),
    (standard_id, 'Coins', 'Arrondis', 0);

    -- 2. Cartes d'affaires Premium
    INSERT INTO public.products (name, category, default_price, description)
    VALUES (
        'Cartes d''affaires Premium',
        'Cartes d''affaires',
        0.00,
        'Cartes d''affaires épaisses et luxueuses qui laissent une impression mémorable. Disponibles avec des finitions spéciales pour un look et un toucher distinctifs.'
    ) RETURNING id INTO premium_id;

    -- Association avec le fournisseur
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    VALUES (premium_id, sinalite_id);

    -- Variantes pour Cartes Premium
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, cost_price) VALUES
    (premium_id, 'Papier', '22PT', 0),
    (premium_id, 'Papier', '38PT', 0),
    (premium_id, 'Finition', 'Suede', 0),
    (premium_id, 'Finition', 'Soft Touch', 0),
    (premium_id, 'Caractéristiques', 'Spot UV', 0),
    (premium_id, 'Caractéristiques', 'Foil Or', 0),
    (premium_id, 'Caractéristiques', 'Foil Argent', 0),
    (premium_id, 'Caractéristiques', 'Foil Cuivre', 0),
    (premium_id, 'Caractéristiques', 'Bords Peints', 0);

    -- 3. Cartes d'affaires en Plastique
    INSERT INTO public.products (name, category, default_price, description)
    VALUES (
        'Cartes d''affaires en Plastique',
        'Cartes d''affaires',
        0.00,
        'Cartes d''affaires durables et résistantes à l''eau, fabriquées en plastique. Idéales pour les cartes de fidélité, les cartes de membre ou pour un look moderne et durable.'
    ) RETURNING id INTO plastic_id;

    -- Association avec le fournisseur
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    VALUES (plastic_id, sinalite_id);

    -- Variantes pour Cartes Plastique
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, cost_price) VALUES
    (plastic_id, 'Type de plastique', 'Blanc', 0),
    (plastic_id, 'Type de plastique', 'Opaque', 0),
    (plastic_id, 'Type de plastique', 'Clair (Transparent)', 0),
    (plastic_id, 'Épaisseur', '20PT', 0),
    (plastic_id, 'Coins', 'Arrondis', 0);

    -- 4. Cartes d'affaires Kraft
    INSERT INTO public.products (name, category, default_price, description)
    VALUES (
        'Cartes d''affaires Kraft',
        'Cartes d''affaires',
        0.00,
        'Cartes fabriquées à partir de papier recyclé à 30%, offrant un aspect naturel, organique et rustique. Le papier non couché est facile à écrire.'
    ) RETURNING id INTO kraft_id;

    -- Association avec le fournisseur
    INSERT INTO public.product_suppliers (product_id, supplier_id)
    VALUES (kraft_id, sinalite_id);

    -- Variantes pour Cartes Kraft
    INSERT INTO public.product_variants (product_id, attribute_name, attribute_value, cost_price) VALUES
    (kraft_id, 'Papier', '18PT Kraft', 0),
    (kraft_id, 'Coins', 'Carrés', 0),
    (kraft_id, 'Coins', 'Arrondis', 0);

END $$;