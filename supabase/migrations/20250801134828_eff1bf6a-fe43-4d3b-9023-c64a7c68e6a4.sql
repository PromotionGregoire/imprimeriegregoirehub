-- Créer la fonction de génération de code produit
CREATE OR REPLACE FUNCTION public.generate_product_code(product_name text, product_category text)
RETURNS text
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
    name_prefix TEXT;
    category_prefix TEXT;
    next_num INTEGER;
    result TEXT;
BEGIN
    -- Extract first 3 letters from product name (uppercase, remove spaces and special chars)
    name_prefix := UPPER(SUBSTRING(REGEXP_REPLACE(product_name, '[^A-Za-z]', '', 'g') FROM 1 FOR 3));
    
    -- Extract first 3 letters from category (uppercase, remove spaces and special chars)
    category_prefix := UPPER(SUBSTRING(REGEXP_REPLACE(product_category, '[^A-Za-z]', '', 'g') FROM 1 FOR 3));
    
    -- Get next sequential number for this prefix combination
    SELECT COALESCE(MAX(CAST(SUBSTRING(product_code FROM LENGTH(name_prefix || '-' || category_prefix || '-') + 1) AS INTEGER)), 0) + 1 
    INTO next_num 
    FROM public.products 
    WHERE product_code ~ ('^' || name_prefix || '-' || category_prefix || '-[0-9]+$');
    
    -- Format: ABC-DEF-001
    result := name_prefix || '-' || category_prefix || '-' || LPAD(next_num::TEXT, 3, '0');
    RETURN result;
END;
$function$;

-- Créer le trigger pour la génération automatique du code produit
CREATE OR REPLACE FUNCTION public.auto_generate_product_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
    -- Only generate code if it's empty or null
    IF NEW.product_code IS NULL OR NEW.product_code = '' THEN
        NEW.product_code := generate_product_code(NEW.name, NEW.category);
    END IF;
    RETURN NEW;
END;
$function$;

-- Créer le trigger sur la table products
DROP TRIGGER IF EXISTS trigger_auto_generate_product_code ON public.products;
CREATE TRIGGER trigger_auto_generate_product_code
    BEFORE INSERT ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_product_code();