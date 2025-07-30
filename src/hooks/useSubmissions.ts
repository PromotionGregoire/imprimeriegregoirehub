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
    mutationFn: async ({ id, submissionData, previousTotal }: { 
      id: string; 
      submissionData: Partial<SubmissionFormData>; 
      previousTotal?: number;
    }) => {
      console.log('=== UPDATE SUBMISSION HOOK DEBUG ===');
      console.log('Submission ID:', id);
      console.log('Data to update:', submissionData);
      
      // Ensure we have the complete data for update
      const updateData: any = {};
      
      if (submissionData.deadline !== undefined) {
        updateData.deadline = submissionData.deadline;
      }
      if (submissionData.total_price !== undefined) {
        updateData.total_price = submissionData.total_price;
      }
      
      // Update submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      console.log('Supabase update result:', { submission, submissionError });

      if (submissionError) {
        console.error('Submission update error:', submissionError);
        throw submissionError;
      }

      // Only update items if they are provided
      if (submissionData.items && submissionData.items.length > 0) {
        // Delete existing items
        console.log('Deleting existing items for submission:', id);
        const { error: deleteError } = await supabase
          .from('submission_items')
          .delete()
          .eq('submission_id', id);

        if (deleteError) {
          console.error('Delete items error:', deleteError);
          throw deleteError;
        }

        // Create new submission items
        const itemsWithSubmissionId = submissionData.items.map(item => ({
          submission_id: id,
          product_name: item.product_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price
        }));

        console.log('Creating new items:', itemsWithSubmissionId);
        const { error: itemsError } = await supabase
          .from('submission_items')
          .insert(itemsWithSubmissionId);

        if (itemsError) {
          console.error('Insert items error:', itemsError);
          throw itemsError;
        }
      }

      // Enhanced activity logging
      if (user) {
        const newTotal = submissionData.total_price || Number(submission.total_price);
        let description = `L'employé ${user.email} a modifié la soumission ${submission.submission_number}.`;
        
        if (previousTotal !== undefined && previousTotal !== newTotal) {
          description += ` Le montant total est passé de ${previousTotal.toFixed(2)}$ à ${newTotal.toFixed(2)}$.`;
        }
        
        await supabase
          .from('activity_logs')
          .insert([{
            client_id: submission.client_id,
            action_type: 'submission_updated',
            description,
            created_by: user.id,
            metadata: {
              previous_total: previousTotal,
              new_total: newTotal,
              items_count: submissionData.items?.length
            }
          }]);
      }

      console.log('Update completed successfully');
      return submission;
    },
    onSuccess: (data) => {
      console.log('Invalidating queries for submission:', data.id);
      queryClient.invalidateQueries({ queryKey: ['submission-details', data.id] });
      queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['client-submissions', data.client_id] });
      queryClient.invalidateQueries({ queryKey: ['client-activity-logs', data.client_id] });
    },
    onError: (error) => {
      console.error('Update submission mutation error:', error);
    }
  });
};