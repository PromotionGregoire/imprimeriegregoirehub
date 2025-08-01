-- Add Sinalite supplier if it doesn't exist
INSERT INTO suppliers (name, contact_person, email, phone, website_1, is_goods_supplier, notes)
VALUES (
  'Sinalite',
  'Service Client',
  'info@sinalite.com',
  '+1-800-123-4567',
  'https://sinalite.com',
  true,
  'Fournisseur spécialisé en cartes d''affaires et produits promotionnels'
) ON CONFLICT (name) DO NOTHING;

-- Insert business card products
INSERT INTO products (name, product_code, category, default_price, description, image_url) VALUES
(
  'Cartes d''affaires Standard',
  'BC-STD-001',
  'Impression',
  0.00,
  'Impression couleur de haute qualité sur une variété de cartons. Solution économique et populaire pour le réseautage professionnel. Idéal pour les grandes quantités.',
  '/src/assets/business-cards-standard.jpg'
),
(
  'Cartes d''affaires Premium',
  'BC-PRM-001',
  'Impression',
  0.00,
  'Cartes d''affaires épaisses et luxueuses qui laissent une impression mémorable. Disponibles avec des finitions spéciales pour un look et un toucher distinctifs.',
  '/src/assets/business-cards-premium.jpg'
),
(
  'Cartes d''affaires en Plastique',
  'BC-PLS-001',
  'Impression',
  0.00,
  'Cartes d''affaires durables et résistantes à l''eau, fabriquées en plastique. Idéales pour les cartes de fidélité, les cartes de membre ou pour un look moderne et durable.',
  '/src/assets/business-cards-plastic.jpg'
),
(
  'Cartes d''affaires Kraft',
  'BC-KFT-001',
  'Impression',
  0.00,
  'Cartes fabriquées à partir de papier recyclé à 30%, offrant un aspect naturel, organique et rustique. Le papier non couché est facile à écrire.',
  '/src/assets/business-cards-kraft.jpg'
);

-- Link products to Sinalite supplier
INSERT INTO product_suppliers (product_id, supplier_id)
SELECT p.id, s.id
FROM products p, suppliers s
WHERE s.name = 'Sinalite'
AND p.product_code IN ('BC-STD-001', 'BC-PRM-001', 'BC-PLS-001', 'BC-KFT-001');

-- Add variants for Standard Business Cards
INSERT INTO product_variants (product_id, attribute_name, attribute_value, cost_price)
SELECT p.id, 'Papier', '14PT', 0.00
FROM products p WHERE p.product_code = 'BC-STD-001'
UNION ALL
SELECT p.id, 'Papier', '16PT', 0.00
FROM products p WHERE p.product_code = 'BC-STD-001'
UNION ALL
SELECT p.id, 'Finition', 'Matte', 0.00
FROM products p WHERE p.product_code = 'BC-STD-001'
UNION ALL
SELECT p.id, 'Finition', 'UV (High Gloss)', 0.00
FROM products p WHERE p.product_code = 'BC-STD-001'
UNION ALL
SELECT p.id, 'Coins', 'Carrés', 0.00
FROM products p WHERE p.product_code = 'BC-STD-001'
UNION ALL
SELECT p.id, 'Coins', 'Arrondis', 0.00
FROM products p WHERE p.product_code = 'BC-STD-001';

-- Add variants for Premium Business Cards
INSERT INTO product_variants (product_id, attribute_name, attribute_value, cost_price)
SELECT p.id, 'Papier', '22PT', 0.00
FROM products p WHERE p.product_code = 'BC-PRM-001'
UNION ALL
SELECT p.id, 'Papier', '38PT', 0.00
FROM products p WHERE p.product_code = 'BC-PRM-001'
UNION ALL
SELECT p.id, 'Finition', 'Suede', 0.00
FROM products p WHERE p.product_code = 'BC-PRM-001'
UNION ALL
SELECT p.id, 'Finition', 'Soft Touch', 0.00
FROM products p WHERE p.product_code = 'BC-PRM-001'
UNION ALL
SELECT p.id, 'Caractéristiques', 'Spot UV', 0.00
FROM products p WHERE p.product_code = 'BC-PRM-001'
UNION ALL
SELECT p.id, 'Caractéristiques', 'Foil Or', 0.00
FROM products p WHERE p.product_code = 'BC-PRM-001'
UNION ALL
SELECT p.id, 'Caractéristiques', 'Foil Argent', 0.00
FROM products p WHERE p.product_code = 'BC-PRM-001'
UNION ALL
SELECT p.id, 'Caractéristiques', 'Foil Cuivre', 0.00
FROM products p WHERE p.product_code = 'BC-PRM-001'
UNION ALL
SELECT p.id, 'Caractéristiques', 'Bords Peints', 0.00
FROM products p WHERE p.product_code = 'BC-PRM-001';

-- Add variants for Plastic Business Cards
INSERT INTO product_variants (product_id, attribute_name, attribute_value, cost_price)
SELECT p.id, 'Type de plastique', 'Blanc', 0.00
FROM products p WHERE p.product_code = 'BC-PLS-001'
UNION ALL
SELECT p.id, 'Type de plastique', 'Opaque', 0.00
FROM products p WHERE p.product_code = 'BC-PLS-001'
UNION ALL
SELECT p.id, 'Type de plastique', 'Clair (Transparent)', 0.00
FROM products p WHERE p.product_code = 'BC-PLS-001'
UNION ALL
SELECT p.id, 'Épaisseur', '20PT', 0.00
FROM products p WHERE p.product_code = 'BC-PLS-001'
UNION ALL
SELECT p.id, 'Coins', 'Arrondis', 0.00
FROM products p WHERE p.product_code = 'BC-PLS-001';

-- Add variants for Kraft Business Cards
INSERT INTO product_variants (product_id, attribute_name, attribute_value, cost_price)
SELECT p.id, 'Papier', '18PT Kraft', 0.00
FROM products p WHERE p.product_code = 'BC-KFT-001'
UNION ALL
SELECT p.id, 'Coins', 'Carrés', 0.00
FROM products p WHERE p.product_code = 'BC-KFT-001'
UNION ALL
SELECT p.id, 'Coins', 'Arrondis', 0.00
FROM products p WHERE p.product_code = 'BC-KFT-001';