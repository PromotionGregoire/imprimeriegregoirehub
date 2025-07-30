import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useProofToggle = (submissionId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ isAccepted }: { isAccepted: boolean }) => {
      if (!isAccepted) {
        // Simple toggle off - no order creation needed
        return { proofAccepted: false };
      }

      // Get submission details first
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select(`
          *,
          clients (business_name),
          submission_items (*)
        `)
        .eq('id', submissionId)
        .single();

      if (submissionError) throw submissionError;

      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('submission_id', submissionId)
        .single();

      if (existingOrder) {
        return { proofAccepted: true, orderId: existingOrder.id };
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          submission_id: submissionId,
          client_id: submission.client_id,
          total_price: submission.total_price,
          status: 'En attente de l\'épreuve'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Log the activity
      if (user) {
        await supabase
          .from('activity_logs')
          .insert([{
            client_id: submission.client_id,
            action_type: 'proof_accepted',
            description: `L'épreuve de la soumission ${submission.submission_number} a été acceptée par ${user.email}. Commande ${order.order_number} créée automatiquement.`,
            created_by: user.id,
            metadata: {
              submission_id: submissionId,
              order_id: order.id,
              submission_number: submission.submission_number,
              order_number: order.order_number
            }
          }]);
      }

      return { proofAccepted: true, orderId: order.id, orderNumber: order.order_number };
    },
    onSuccess: (data) => {
      if (data.orderId) {
        toast({
          title: '✅ Épreuve acceptée',
          description: `Commande ${data.orderNumber} créée automatiquement`,
        });
      } else {
        toast({
          title: 'Épreuve mise à jour',
          description: 'Le statut de l\'épreuve a été modifié',
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['submission-details', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['client-activity-logs'] });
    },
    onError: () => {
      toast({
        title: '❌ Erreur',
        description: 'Impossible de modifier le statut de l\'épreuve',
        variant: 'destructive',
      });
    }
  });
};

export const useDeliveryToggle = (submissionId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ isDelivered }: { isDelivered: boolean }) => {
      // Get submission details first
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select('client_id, submission_number')
        .eq('id', submissionId)
        .single();

      if (submissionError) throw submissionError;

      // Get associated order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('submission_id', submissionId)
        .single();

      if (orderError) throw orderError;

      // Update order status
      const newStatus = isDelivered ? 'Livré' : 'En cours de production';
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Log the activity
      if (user) {
        const description = isDelivered 
          ? `La commande ${order.order_number} a été marquée comme livrée par ${user.email}.`
          : `La commande ${order.order_number} a été remise en cours de production par ${user.email}.`;

        await supabase
          .from('activity_logs')
          .insert([{
            client_id: submission.client_id,
            action_type: isDelivered ? 'order_delivered' : 'order_production',
            description,
            created_by: user.id,
            metadata: {
              submission_id: submissionId,
              order_id: order.id,
              order_number: order.order_number,
              new_status: newStatus
            }
          }]);
      }

      return { delivered: isDelivered, orderNumber: order.order_number };
    },
    onSuccess: (data) => {
      toast({
        title: data.delivered ? '✅ Commande livrée' : '🔄 Statut mis à jour',
        description: `Commande ${data.orderNumber} ${data.delivered ? 'marquée comme livrée' : 'remise en production'}`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['submission-details', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['client-activity-logs'] });
    },
    onError: () => {
      toast({
        title: '❌ Erreur',
        description: 'Impossible de modifier le statut de livraison',
        variant: 'destructive',
      });
    }
  });
};