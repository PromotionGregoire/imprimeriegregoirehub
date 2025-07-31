-- Fix search path for generate_product_code function
ALTER FUNCTION public.generate_product_code(product_name text, product_category text) 
SET search_path = '';

-- Fix search path for auto_generate_product_code function  
ALTER FUNCTION public.auto_generate_product_code() 
SET search_path = '';