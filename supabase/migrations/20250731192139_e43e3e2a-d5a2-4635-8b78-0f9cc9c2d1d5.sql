-- Fix search path for all remaining functions with mutable search_path
ALTER FUNCTION public.update_proof_status_enum() 
SET search_path = '';

ALTER FUNCTION public.generate_submission_number() 
SET search_path = '';

ALTER FUNCTION public.generate_client_number() 
SET search_path = '';

ALTER FUNCTION public.generate_order_number() 
SET search_path = '';

ALTER FUNCTION public.update_updated_at_column() 
SET search_path = '';

ALTER FUNCTION public.handle_new_user() 
SET search_path = '';