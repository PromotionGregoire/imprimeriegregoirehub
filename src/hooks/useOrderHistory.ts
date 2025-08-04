import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HistoryItem {
  id: string;
  order_id: string;
  proof_id?: string;
  action_type: string;
  action_description: string;
  formatted_date: string;
  created_by_name?: string;
  client_action: boolean;
  proof_version?: number;
  order_number?: string;
  business_name?: string;
  contact_name?: string;
  metadata?: any;
}

export const useOrderHistory = (orderId?: string) => {
  return useQuery({
    queryKey: ['order-history', orderId],
    queryFn: async () => {
      let query = supabase
        .from('v_ordre_historique')
        .select('*');
      
      if (orderId) {
        query = query.eq('order_id', orderId);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as HistoryItem[];
    },
  });
};

export const useAllOrderHistory = () => {
  return useQuery({
    queryKey: ['all-order-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_ordre_historique')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as HistoryItem[];
    },
  });
};