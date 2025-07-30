import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useForceAcceptSubmission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ submissionId, approvedBy }: { submissionId: string; approvedBy: string }) => {
      // Get submission details first
      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select(`
          *,
          clients (*),
          submission_items (*)
        `)
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      // Update submission status to Acceptée
      const { data: updatedSubmission, error: updateError } = await supabase
        .from('submissions')
        .update({ 
          status: 'Acceptée',
          approved_by: approvedBy
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          client_id: submission.client_id,
          submission_id: submissionId,
          total_price: submission.total_price
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Log submission acceptance
      if (user) {
        await supabase
          .from('activity_logs')
          .insert([{
            client_id: submission.client_id,
            action_type: 'submission_accepted_manually',
            description: `La soumission ${submission.submission_number} a été acceptée manuellement par ${user.email}. Personne autorisant: ${approvedBy}.`,
            created_by: user.id
          }]);

        // Log order creation
        await supabase
          .from('activity_logs')
          .insert([{
            client_id: submission.client_id,
            action_type: 'order_created',
            description: `Commande ${order.order_number} créée à partir de la soumission ${submission.submission_number}.`,
            created_by: user.id
          }]);
      }

      return { submission: updatedSubmission, order };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['submission-details', data.submission.id] });
      queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['client-submissions', data.submission.client_id] });
      queryClient.invalidateQueries({ queryKey: ['client-activity-logs', data.submission.client_id] });
    },
  });
};