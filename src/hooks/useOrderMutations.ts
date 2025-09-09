import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, paymentType }: { 
      orderId: string; 
      status: string; 
      paymentType?: string;
    }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Si c'est une mise à jour vers "Marqué Facturé", ajouter l'entrée dans l'historique
      if (status === 'Marqué Facturé' && paymentType) {
        const paymentTypeLabels: Record<string, string> = {
          credit: 'Crédit',
          debit: 'Débit', 
          cash: 'Comptant',
          check: 'Chèque',
          transfer: 'Virement',
          account: 'Facturé au compte',
          exchange: 'Échange',
          sponsorship: 'Commandite'
        };

        // Ajouter dans l'historique de la commande
        const { error: historyError } = await supabase
          .rpc('add_ordre_history', {
            p_order_id: orderId,
            p_action_type: 'mark_invoiced',
            p_action_description: `Commande marquée comme facturée - Paiement par ${paymentTypeLabels[paymentType] || paymentType}`,
            p_metadata: {
              paymentType: paymentType,
              paymentLabel: paymentTypeLabels[paymentType] || paymentType,
              invoicedAt: new Date().toISOString()
            },
            p_client_action: false
          });

        if (historyError) {
          console.error('Erreur lors de l\'ajout à l\'historique:', historyError);
        }
      }

      return { orderId, status, paymentType };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-with-details'] });
      
      let message = 'Statut de la commande mis à jour';
      if (data.status === 'Marqué Facturé') {
        const paymentTypeLabels: Record<string, string> = {
          credit: 'Crédit',
          debit: 'Débit',
          cash: 'Comptant', 
          check: 'Chèque',
          transfer: 'Virement',
          account: 'Facturé au compte',
          exchange: 'Échange',
          sponsorship: 'Commandite'
        };
        message = `Commande marquée comme facturée (${paymentTypeLabels[data.paymentType!] || data.paymentType})`;
      }
      
      toast({
        title: "Succès",
        description: message,
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande",
        variant: "destructive",
      });
    },
  });

  return {
    updateOrderStatus
  };
};