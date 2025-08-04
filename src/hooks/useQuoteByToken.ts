import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface QuoteData {
  quoteNumber: string;
  clientName: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdDate: string;
  validUntil: string;
  status: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
}

export const useQuoteByToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ['quote-by-token', token],
    queryFn: async (): Promise<QuoteData> => {
      if (!token) {
        throw new Error('Token is required');
      }

      // Récupérer la soumission avec le token d'approbation
      const { data: submission, error } = await supabase
        .from('submissions')
        .select(`
          *,
          clients (
            business_name,
            contact_name,
            email,
            phone_number
          ),
          submission_items (
            id,
            product_name,
            description,
            quantity,
            unit_price
          )
        `)
        .eq('approval_token', token)
        .maybeSingle();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(`Erreur lors de la récupération du devis: ${error.message}`);
      }

      if (!submission) {
        console.error('Aucune soumission trouvée pour le token:', token);
        throw new Error('Devis non trouvé ou token invalide');
      }

      console.log('Soumission trouvée:', submission);

      // Calculer les totaux
      const items = submission.submission_items.map((item: any) => ({
        id: item.id,
        description: item.description || item.product_name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        total: item.quantity * parseFloat(item.unit_price)
      }));

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.15; // 15% de taxes (ajustez selon vos besoins)
      const total = subtotal + tax;

      // Formater les dates
      const createdDate = new Date(submission.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const validUntil = new Date(submission.valid_until).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      return {
        quoteNumber: submission.submission_number,
        clientName: submission.clients.business_name,
        contactPerson: submission.clients.contact_name,
        email: submission.clients.email,
        phone: submission.clients.phone_number || 'Non spécifié',
        createdDate,
        validUntil,
        status: submission.status === 'Envoyée' ? 'En attente d\'approbation' : submission.status,
        items,
        subtotal,
        tax,
        total,
        notes: 'Devis valide pendant 30 jours. Prix incluent la livraison standard.'
      };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};