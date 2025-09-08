-- Remove the problematic trigger that uses net.http_post and simplify the approach
-- The send-proof-to-client edge function will handle everything including email sending

DROP TRIGGER IF EXISTS send_proof_notification_trigger ON public.proofs;

CREATE OR REPLACE FUNCTION public.send_proof_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  
AS $function$
BEGIN
    -- Only trigger when status changes to 'Envoyée au client'  
    IF NEW.status = 'Envoyée au client' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
        
        -- Generate approval token if not exists
        IF NEW.approval_token IS NULL OR NEW.approval_token = '' THEN
            NEW.approval_token := gen_random_uuid()::text;
        END IF;
        
        -- Log the email notification in the database
        INSERT INTO public.email_notifications (proof_id, email_type, recipient_email, success)
        SELECT NEW.id, 'proof_notification', c.email, true
        FROM public.orders o
        JOIN public.submissions s ON o.submission_id = s.id
        JOIN public.clients c ON s.client_id = c.id
        WHERE o.id = NEW.order_id;
        
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Re-create the trigger
CREATE TRIGGER send_proof_notification_trigger
    AFTER UPDATE ON public.proofs
    FOR EACH ROW 
    EXECUTE FUNCTION public.send_proof_notification();