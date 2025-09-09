import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFilteredOrders = (
  searchQuery: string,
  statusFilter: string,
  periodFilter: string
) => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders-with-details'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          clients (
            business_name,
            contact_name
          ),
          submissions (
            submission_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(query) ||
        order.clients?.business_name?.toLowerCase().includes(query) ||
        order.submissions?.submission_number?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by period
    if (periodFilter !== 'all') {
      const now = new Date();
      const days = parseInt(periodFilter.replace('days', ''));
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= cutoffDate
      );
    }

    return filtered;
  }, [orders, searchQuery, statusFilter, periodFilter]);

  return {
    orders: filteredOrders,
    isLoading,
    error,
    totalCount: orders?.length || 0,
    filteredCount: filteredOrders.length,
  };
};