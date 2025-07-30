-- Create products table for the product catalog
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    product_code TEXT NOT NULL UNIQUE,
    description TEXT,
    default_price NUMERIC(10,2) DEFAULT 0,
    category TEXT NOT NULL CHECK (category IN ('Impression', 'Article Promotionnel')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for product access
CREATE POLICY "Authenticated users can manage products" 
ON public.products 
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample products
INSERT INTO public.products (name, product_code, description, default_price, category) VALUES
('Cartes d''affaires 16pt Lamination Mate', 'CA-16PT-LM', 'Cartes d''affaires avec impression sur papier 16pt et finition lamination mate', 85.00, 'Impression'),
('Flyers couleur 8.5x11', 'FLY-8511-C', 'Flyers impression couleur format lettre', 120.00, 'Impression'),
('Bannière vinyle 3x6', 'BAN-3X6-V', 'Bannière en vinyle résistant aux intempéries', 75.00, 'Impression'),
('Stylos personnalisés', 'STYLO-PERS', 'Stylos avec logo personnalisé', 2.50, 'Article Promotionnel'),
('Porte-clés en métal', 'PC-METAL', 'Porte-clés personnalisés en métal', 5.00, 'Article Promotionnel'),
('T-shirts promotionnels', 'TSHIRT-PROMO', 'T-shirts avec impression de logo', 15.00, 'Article Promotionnel');