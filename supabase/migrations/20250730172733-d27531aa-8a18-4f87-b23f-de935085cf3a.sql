-- Add modification request notes to submissions table
ALTER TABLE public.submissions 
ADD COLUMN modification_request_notes TEXT,
ADD COLUMN approved_by TEXT,
ADD COLUMN approval_token TEXT UNIQUE DEFAULT gen_random_uuid();