import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAllProofs = () => {
  return useQuery({
    queryKey: ['all-proofs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_all_proofs');

      if (error) throw error;
      return data as any[];
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
};