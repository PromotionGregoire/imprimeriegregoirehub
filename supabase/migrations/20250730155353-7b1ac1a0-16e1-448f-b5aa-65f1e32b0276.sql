-- Add new columns to clients table for complete client management

-- Informations de Facturation
ALTER TABLE public.clients 
ADD COLUMN billing_street TEXT,
ADD COLUMN billing_city TEXT,
ADD COLUMN billing_province TEXT,
ADD COLUMN billing_postal_code TEXT,
ADD COLUMN tax_numbers TEXT,
ADD COLUMN default_payment_terms TEXT DEFAULT 'Net 30 jours';

-- Informations d'Expédition
ALTER TABLE public.clients
ADD COLUMN shipping_street TEXT,
ADD COLUMN shipping_city TEXT,
ADD COLUMN shipping_province TEXT,
ADD COLUMN shipping_postal_code TEXT;

-- Détails du Contact
ALTER TABLE public.clients
ADD COLUMN main_contact_position TEXT,
ADD COLUMN secondary_contact_info TEXT;

-- Segmentation & Marketing
ALTER TABLE public.clients
ADD COLUMN client_type TEXT DEFAULT 'Entreprise',
ADD COLUMN industry TEXT,
ADD COLUMN lead_source TEXT;

-- Suivi Interne
ALTER TABLE public.clients
ADD COLUMN status TEXT DEFAULT 'Prospect',
ADD COLUMN assigned_user_id UUID REFERENCES public.profiles(id),
ADD COLUMN general_notes TEXT;

-- Add indexes for better performance
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_client_type ON public.clients(client_type);
CREATE INDEX idx_clients_assigned_user ON public.clients(assigned_user_id);

-- Add comments for documentation
COMMENT ON COLUMN public.clients.billing_street IS 'Rue pour adresse de facturation';
COMMENT ON COLUMN public.clients.shipping_street IS 'Rue pour adresse d''expédition';
COMMENT ON COLUMN public.clients.client_type IS 'Type de client: Entreprise, OSBL, École, Gouvernement';
COMMENT ON COLUMN public.clients.status IS 'Statut: Prospect, Actif, Inactif';
COMMENT ON COLUMN public.clients.assigned_user_id IS 'Employé responsable du client';