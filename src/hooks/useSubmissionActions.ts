import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useCloneSubmission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      // Get original submission data
      const { data: originalSubmission, error: fetchError } = await supabase
        .from('submissions')
        .select(`
          *,
          submission_items (*)
        `)
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      // Create new submission
      const { data: newSubmission, error: submissionError } = await supabase
        .from('submissions')
        .insert([{
          client_id: originalSubmission.client_id,
          deadline: originalSubmission.deadline,
          total_price: originalSubmission.total_price,
          status: 'Brouillon'
        }])
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Clone submission items
      if (originalSubmission.submission_items?.length > 0) {
        const clonedItems = originalSubmission.submission_items.map((item: any) => ({
          submission_id: newSubmission.id,
          product_name: item.product_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('submission_items')
          .insert(clonedItems);

        if (itemsError) throw itemsError;
      }

      // Log the activity
      if (user) {
        await supabase
          .from('activity_logs')
          .insert([{
            client_id: originalSubmission.client_id,
            action_type: 'submission_cloned',
            description: `La soumission ${originalSubmission.submission_number} a été clonée vers ${newSubmission.submission_number} par ${user.email}.`,
            created_by: user.id
          }]);
      }

      return newSubmission;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['client-submissions', data.client_id] });
      queryClient.invalidateQueries({ queryKey: ['client-activity-logs', data.client_id] });
    },
  });
};

export const useDeleteSubmission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      // Get submission info for logging
      const { data: submission } = await supabase
        .from('submissions')
        .select('client_id, submission_number')
        .eq('id', submissionId)
        .single();

      // Delete submission items first
      const { error: itemsError } = await supabase
        .from('submission_items')
        .delete()
        .eq('submission_id', submissionId);

      if (itemsError) throw itemsError;

      // Delete submission
      const { error: submissionError } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (submissionError) throw submissionError;

      // Log the activity
      if (user && submission) {
        await supabase
          .from('activity_logs')
          .insert([{
            client_id: submission.client_id,
            action_type: 'submission_deleted',
            description: `La soumission ${submission.submission_number} a été supprimée par ${user.email}.`,
            created_by: user.id
          }]);
      }

      return submission;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
        queryClient.invalidateQueries({ queryKey: ['client-submissions', data.client_id] });
        queryClient.invalidateQueries({ queryKey: ['client-activity-logs', data.client_id] });
      }
    },
  });
};

export const useUpdateSubmissionStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ submissionId, status }: { submissionId: string; status: string }) => {
      const { data: submission, error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', submissionId)
        .select('*, clients(business_name)')
        .single();

      if (error) throw error;

      // Log the activity
      if (user) {
        await supabase
          .from('activity_logs')
          .insert([{
            client_id: submission.client_id,
            action_type: 'submission_status_changed',
            description: `Le statut de la soumission ${submission.submission_number} a été changé à "${status}" par ${user.email}.`,
            created_by: user.id
          }]);
      }

      return submission;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['submission-details', data.id] });
      queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['client-submissions', data.client_id] });
      queryClient.invalidateQueries({ queryKey: ['client-activity-logs', data.client_id] });
    },
  });
};