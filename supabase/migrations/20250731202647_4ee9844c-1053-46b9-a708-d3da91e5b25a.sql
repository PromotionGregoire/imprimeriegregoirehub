-- Create email_notifications table to track sent emails
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_id UUID REFERENCES public.proofs(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for email_notifications
CREATE POLICY "Users can view email notifications for their proofs" 
ON public.email_notifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.proofs p
    JOIN public.orders o ON p.order_id = o.id
    JOIN public.submissions s ON o.submission_id = s.id
    WHERE p.id = proof_id
  )
);

CREATE POLICY "Admins can view all email notifications" 
ON public.email_notifications 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "System can insert email notifications" 
ON public.email_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create function to send proof notification
CREATE OR REPLACE FUNCTION public.send_proof_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    proof_record RECORD;
    approval_token TEXT;
BEGIN
    -- Only trigger when status changes to 'Envoyée au client'
    IF NEW.status = 'Envoyée au client' AND (OLD.status IS NULL OR OLD.status != 'Envoyée au client') THEN
        
        -- Get proof, order, submission and client details
        SELECT 
            p.id as proof_id,
            p.approval_token,
            o.order_number, 
            s.submission_number, 
            c.business_name, 
            c.contact_email, 
            c.contact_name
        INTO proof_record
        FROM public.proofs p
        JOIN public.orders o ON p.order_id = o.id
        JOIN public.submissions s ON o.submission_id = s.id
        JOIN public.clients c ON s.client_id = c.id
        WHERE p.id = NEW.id;
        
        -- Generate approval token if not exists
        IF NEW.approval_token IS NULL OR NEW.approval_token = '' THEN
            approval_token := gen_random_uuid()::text;
            
            -- Update the proof with the approval token
            UPDATE public.proofs 
            SET approval_token = approval_token 
            WHERE id = NEW.id;
        ELSE
            approval_token := NEW.approval_token;
        END IF;
        
        -- Call the edge function to send email
        PERFORM
            net.http_post(
                url := 'https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/send-proof-notification',
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
                body := json_build_object(
                    'clientEmail', proof_record.contact_email,
                    'clientName', proof_record.contact_name,
                    'businessName', proof_record.business_name,
                    'proofId', NEW.id,
                    'approvalToken', approval_token,
                    'orderNumber', proof_record.order_number,
                    'submissionNumber', proof_record.submission_number
                )::text
            );
        
        -- Log the email notification
        INSERT INTO public.email_notifications (proof_id, email_type, recipient_email)
        VALUES (NEW.id, 'proof_notification', proof_record.contact_email);
        
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic proof notifications
CREATE TRIGGER trigger_send_proof_notification
    AFTER UPDATE ON public.proofs
    FOR EACH ROW
    EXECUTE FUNCTION public.send_proof_notification();