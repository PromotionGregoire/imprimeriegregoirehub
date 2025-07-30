import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SubmissionItem {
  id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface SubmissionFormData {
  client_id: string;
  deadline?: string;
  items: SubmissionItem[];
  subtotal: number;
  tax_amount?: number;
  total_price: number;
}

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ submissionData, status }: { submissionData: SubmissionFormData; status: 'Brouillon' | 'Envoyée' }) => {
      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert([{
          client_id: submissionData.client_id,
          deadline: submissionData.deadline,
          total_price: submissionData.total_price,
          status: status,
          ...(status === 'Envoyée' && { sent_at: new Date().toISOString() })
        }])
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Create submission items
      const itemsWithSubmissionId = submissionData.items.map(item => ({
        submission_id: submission.id,
        product_name: item.product_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('submission_items')
        .insert(itemsWithSubmissionId);

      if (itemsError) throw itemsError;

      // Log the activity
      if (user) {
        const description = status === 'Brouillon' 
          ? `L'employé ${user.email} a créé une nouvelle soumission en brouillon.`
          : `La soumission ${submission.submission_number} a été envoyée au client par ${user.email}.`;

        await supabase
          .from('activity_logs')
          .insert([{
            client_id: submissionData.client_id,
            action_type: status === 'Brouillon' ? 'submission_created' : 'submission_sent',
            description,
            created_by: user.id
          }]);
      }

      return submission;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-submissions', data.client_id] });
      queryClient.invalidateQueries({ queryKey: ['client-activity-logs', data.client_id] });
      queryClient.invalidateQueries({ queryKey: ['client-kpis', data.client_id] });
    },
  });
};

export const useUpdateSubmission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, submissionData }: { id: string; submissionData: Partial<SubmissionFormData> }) => {
      // Update submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .update({
          deadline: submissionData.deadline,
          total_price: submissionData.total_price,
        })
        .eq('id', id)
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('submission_items')
        .delete()
        .eq('submission_id', id);

      if (deleteError) throw deleteError;

      // Create new submission items
      if (submissionData.items) {
        const itemsWithSubmissionId = submissionData.items.map(item => ({
          submission_id: id,
          product_name: item.product_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('submission_items')
          .insert(itemsWithSubmissionId);

        if (itemsError) throw itemsError;
      }

      // Log the activity
      if (user) {
        await supabase
          .from('activity_logs')
          .insert([{
            client_id: submission.client_id,
            action_type: 'submission_updated',
            description: `La soumission ${submission.submission_number} a été modifiée par ${user.email}.`,
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