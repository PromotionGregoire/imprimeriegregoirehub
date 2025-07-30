-- Create function for auto-incrementing client numbers
CREATE OR REPLACE FUNCTION generate_client_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    result TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(client_number FROM 5) AS INTEGER)), 0) + 1 
    INTO next_num 
    FROM public.clients 
    WHERE client_number ~ '^CLI-[0-9]+$';
    
    result := 'CLI-' || LPAD(next_num::TEXT, 4, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function for auto-incrementing submission numbers
CREATE OR REPLACE FUNCTION generate_submission_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    current_year TEXT;
    result TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(submission_number FROM LENGTH('S-' || current_year || '-') + 1) AS INTEGER)), 0) + 1 
    INTO next_num 
    FROM public.submissions 
    WHERE submission_number ~ ('^S-' || current_year || '-[0-9]+$');
    
    result := 'S-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function for auto-incrementing order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    current_year TEXT;
    result TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM LENGTH('C-' || current_year || '-') + 1) AS INTEGER)), 0) + 1 
    INTO next_num 
    FROM public.orders 
    WHERE order_number ~ ('^C-' || current_year || '-[0-9]+$');
    
    result := 'C-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create clients table
CREATE TABLE public.clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    client_number TEXT NOT NULL UNIQUE DEFAULT generate_client_number(),
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL
);

-- Create submissions table
CREATE TABLE public.submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    submission_number TEXT NOT NULL UNIQUE DEFAULT generate_submission_number(),
    status TEXT NOT NULL DEFAULT 'Brouillon' CHECK (status IN ('Brouillon', 'Envoyée', 'Acceptée', 'Modification Demandée', 'Refusée')),
    total_price DECIMAL(10,2),
    deadline TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Create submission_items table
CREATE TABLE public.submission_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    order_number TEXT NOT NULL UNIQUE DEFAULT generate_order_number(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'En attente de l''épreuve' CHECK (status IN ('En attente de l''épreuve', 'En production', 'Expédiée', 'Complétée')),
    total_price DECIMAL(10,2) NOT NULL
);

-- Create profiles table for employees (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('EMPLOYEE', 'ADMIN'))
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submission_items_updated_at
    BEFORE UPDATE ON public.submission_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (employees)
CREATE POLICY "Authenticated users can manage clients" 
ON public.clients 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage submissions" 
ON public.submissions 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage submission items" 
ON public.submission_items 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage orders" 
ON public.orders 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Users can view and update their own profile" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Nouvel Employé'),
        'EMPLOYEE'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_submissions_client_id ON public.submissions(client_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submission_items_submission_id ON public.submission_items(submission_id);
CREATE INDEX idx_orders_submission_id ON public.orders(submission_id);
CREATE INDEX idx_orders_client_id ON public.orders(client_id);
CREATE INDEX idx_orders_status ON public.orders(status);