CREATE TABLE public.proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'A preparer',
  version INTEGER NOT NULL DEFAULT 1,
  file_url TEXT,
  approval_token TEXT UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage proofs" ON public.proofs FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_proofs_order_id ON public.proofs(order_id);

CREATE TRIGGER update_proofs_updated_at 
BEFORE UPDATE ON public.proofs 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();