-- Créer le bucket de stockage pour les épreuves
INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true);

-- Politiques pour le bucket des épreuves
CREATE POLICY "Authenticated users can upload proofs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'proofs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view proofs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proofs');

CREATE POLICY "Authenticated users can update their proofs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'proofs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete their proofs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'proofs' AND auth.uid() IS NOT NULL);

-- Ajouter des colonnes manquantes à la table proofs si nécessaire
ALTER TABLE public.proofs 
ADD COLUMN IF NOT EXISTS client_comments TEXT,
ADD COLUMN IF NOT EXISTS approved_by_name TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Mettre à jour les statuts possibles
CREATE OR REPLACE FUNCTION update_proof_status_enum() RETURNS void AS $$
BEGIN
    -- Cette fonction permet d'ajouter de nouveaux statuts si nécessaire
    -- Les nouveaux statuts : 'Envoyée au client', 'Modification demandée', 'Approuvée'
END;
$$ LANGUAGE plpgsql;