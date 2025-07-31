import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProofs = () => {
  return useQuery({
    queryKey: ['proofs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proofs')
        .select(`
          id,
          order_id,
          status,
          version,
          created_at,
          orders!inner (
            order_number,
            clients!inner (
              business_name,
              contact_name
            )
          )
        `)
        .neq('status', 'Approuvée')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};