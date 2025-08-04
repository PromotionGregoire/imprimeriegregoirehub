-- Fix mutable search path security issue for update_monitoring_config_updated_at function
CREATE OR REPLACE FUNCTION public.update_monitoring_config_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;