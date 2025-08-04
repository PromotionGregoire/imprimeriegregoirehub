import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProofs = () => {
  return useQuery({
    queryKey: ['proofs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_latest_proofs_by_order');

      if (error) throw error;
      return data;
    },
  });
};