-- Partie 2 : Évolution Majeure de la Base de Données

-- Action 1 : Mettre à jour la table suppliers
-- Ajouter les nouveaux champs d'information
ALTER TABLE public.suppliers 
ADD COLUMN website_1 TEXT,
ADD COLUMN website_2 TEXT,
ADD COLUMN is_goods_supplier BOOLEAN DEFAULT false,
ADD COLUMN is_service_supplier BOOLEAN DEFAULT false;

-- Migrer les données existantes du champ type vers les nouveaux booléens
UPDATE public.suppliers 
SET is_goods_supplier = true 
WHERE type = 'Fournisseur de biens';

UPDATE public.suppliers 
SET is_service_supplier = true 
WHERE type = 'Fournisseur de services';

-- Supprimer l'ancienne colonne type et sa contrainte
ALTER TABLE public.suppliers DROP CONSTRAINT IF EXISTS suppliers_type_check;
ALTER TABLE public.suppliers DROP COLUMN type;

-- Action 2 : Créer une table de liaison product_suppliers
-- Permettre à un produit d'avoir plusieurs fournisseurs
CREATE TABLE public.product_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Contrainte unique pour éviter les doublons
  CONSTRAINT unique_product_supplier UNIQUE (product_id, supplier_id)
);

-- Action 3 : Créer une table de liaison supplier_categories
-- Associer des catégories de produits à un fournisseur
CREATE TABLE public.supplier_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Contrainte unique pour éviter les doublons
  CONSTRAINT unique_supplier_category UNIQUE (supplier_id, category_name)
);

-- Migrer les données existantes de la colonne supplier_id des produits
-- vers la nouvelle table de liaison product_suppliers
INSERT INTO public.product_suppliers (product_id, supplier_id)
SELECT id, supplier_id 
FROM public.products 
WHERE supplier_id IS NOT NULL;

-- Supprimer l'ancienne colonne supplier_id de la table products
ALTER TABLE public.products DROP COLUMN supplier_id;

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_categories ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour product_suppliers
CREATE POLICY "Authenticated users can manage product suppliers" 
ON public.product_suppliers 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Créer les politiques RLS pour supplier_categories
CREATE POLICY "Authenticated users can manage supplier categories" 
ON public.supplier_categories 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Créer des index pour optimiser les performances
CREATE INDEX idx_product_suppliers_product_id ON public.product_suppliers(product_id);
CREATE INDEX idx_product_suppliers_supplier_id ON public.product_suppliers(supplier_id);
CREATE INDEX idx_supplier_categories_supplier_id ON public.supplier_categories(supplier_id);
CREATE INDEX idx_supplier_categories_category_name ON public.supplier_categories(category_name);