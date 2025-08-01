-- Add price column to product_variants table
ALTER TABLE public.product_variants 
ADD COLUMN price NUMERIC DEFAULT 0;

-- Add comment to explain the price column
COMMENT ON COLUMN public.product_variants.price IS 'Prix spécifique pour cette variante. Si 0, utilise le prix par défaut du produit.';