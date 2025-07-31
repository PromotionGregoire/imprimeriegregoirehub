-- Add category_type column to supplier_categories table to distinguish between goods and services
ALTER TABLE public.supplier_categories 
ADD COLUMN category_type TEXT NOT NULL DEFAULT 'Bien';

-- Add a check constraint to ensure category_type is either 'Bien' or 'Service'
ALTER TABLE public.supplier_categories 
ADD CONSTRAINT check_category_type CHECK (category_type IN ('Bien', 'Service'));