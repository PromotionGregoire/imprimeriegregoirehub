-- PHASE 4: Politique RLS pour l'accès public aux épreuves via validation_token
-- Permet aux utilisateurs non authentifiés d'accéder aux épreuves avec un token valide

CREATE POLICY "Public access to proofs with valid validation token" ON public.proofs
    FOR SELECT 
    TO anon, authenticated
    USING (
        validation_token IS NOT NULL 
        AND validation_token != '' 
        AND is_active = true
    );