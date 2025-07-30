import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientKPIs {
  totalRevenue: number;
  totalSubmissions: number;
  totalOrders: number;
  conversionRate: number;
}

export const useClientDetails = (clientId: string) => {
  return useQuery({
    queryKey: ['client-details', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
};

export const useClientKPIs = (clientId: string) => {
  return useQuery({
    queryKey: ['client-kpis', clientId],
    queryFn: async (): Promise<ClientKPIs> => {
      // Get completed orders total revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_price')
        .eq('client_id', clientId);

      if (ordersError) throw ordersError;

      // Get total submissions count
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('id')
        .eq('client_id', clientId);

      if (submissionsError) throw submissionsError;

      // Get total orders count
      const { data: ordersCount, error: ordersCountError } = await supabase
        .from('orders')
        .select('id')
        .eq('client_id', clientId);

      if (ordersCountError) throw ordersCountError;

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_price || 0), 0) || 0;
      const totalSubmissions = submissions?.length || 0;
      const totalOrders = ordersCount?.length || 0;
      const conversionRate = totalSubmissions > 0 ? (totalOrders / totalSubmissions) * 100 : 0;

      return {
        totalRevenue,
        totalSubmissions,
        totalOrders,
        conversionRate,
      };
    },
    enabled: !!clientId,
  });
};

export const useClientSubmissions = (clientId: string) => {
  return useQuery({
    queryKey: ['client-submissions', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
};

export const useClientOrders = (clientId: string) => {
  return useQuery({
    queryKey: ['client-orders', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
};

export const useClientActivityLogs = (clientId: string) => {
  return useQuery({
    queryKey: ['client-activity-logs', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
};