-- Fix send_proof_notification trigger to use correct client email field and avoid failure on proofs status update
CREATE OR REPLACE FUNCTION public.send_proof_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    proof_record RECORD;
    v_approval_token TEXT;
BEGIN
    -- Only trigger when status changes to 'Envoyée au client'
    IF NEW.status = 'Envoyée au client' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
        
        -- Get proof, order, submission and client details using correct email field
        SELECT 
            p.id as proof_id,
            p.approval_token,
            o.order_number, 
            s.submission_number, 
            c.business_name, 
            c.email, 
            c.contact_name
        INTO proof_record
        FROM public.proofs p
        JOIN public.orders o ON p.order_id = o.id
        JOIN public.submissions s ON o.submission_id = s.id
        JOIN public.clients c ON s.client_id = c.id
        WHERE p.id = NEW.id;
        
        -- Generate approval token if not exists
        IF NEW.approval_token IS NULL OR NEW.approval_token = '' THEN
            v_approval_token := gen_random_uuid()::text;
            
            -- Update the proof with the approval token (use variable v_approval_token)
            UPDATE public.proofs 
            SET approval_token = v_approval_token 
            WHERE id = NEW.id;
        ELSE
            v_approval_token := NEW.approval_token;
        END IF;
        
        -- Call the edge function to send email
        PERFORM
            net.http_post(
                url := 'https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/send-proof-notification',
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
                body := json_build_object(
                    'clientEmail', proof_record.email,
                    'clientName', proof_record.contact_name,
                    'businessName', proof_record.business_name,
                    'proofId', NEW.id,
                    'approvalToken', v_approval_token,
                    'orderNumber', proof_record.order_number,
                    'submissionNumber', proof_record.submission_number
                )::text
            );
        
        -- Log the email notification
        INSERT INTO public.email_notifications (proof_id, email_type, recipient_email)
        VALUES (NEW.id, 'proof_notification', proof_record.email);
        
    END IF;
    
    RETURN NEW;
END;
$function$;