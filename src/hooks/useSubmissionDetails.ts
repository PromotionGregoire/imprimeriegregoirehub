import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSubmissionDetails = (submissionId: string) => {
  return useQuery({
    queryKey: ['submission-details', submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          clients (
            business_name,
            contact_name,
            email
          ),
          submission_items (
            id,
            product_name,
            description,
            quantity,
            unit_price
          )
        `)
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!submissionId,
  });
};