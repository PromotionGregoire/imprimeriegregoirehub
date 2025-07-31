-- Add foreign key constraint between proofs and orders
ALTER TABLE public.proofs 
ADD CONSTRAINT fk_proofs_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;