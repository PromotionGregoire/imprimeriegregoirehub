import { useMemo } from 'react';
import { useClients } from './useClients';
import { useAllSubmissions } from './useAllSubmissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArchiveFilter } from '@/utils/archiveUtils';

export const useFilteredClientsByActivity = (
  searchQuery: string,
  statusFilter: string,
  activityFilter: string,
  archiveFilter: ArchiveFilter = 'actives'
) => {
  const { data: clients, isLoading: clientsLoading, error: clientsError } = useClients();
  const { data: submissions, isLoading: submissionsLoading } = useAllSubmissions(archiveFilter);
  
  // Fetch orders data
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', archiveFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*');
      
      if (error) throw error;
      
      // Filter based on archive status
      if (archiveFilter === 'actives') {
        return data?.filter(order => !order.archived_at) || [];
      } else if (archiveFilter === 'archived') {
        return data?.filter(order => order.archived_at) || [];
      }
      return data || [];
    },
  });

  // Fetch proofs data
  const { data: proofs, isLoading: proofsLoading } = useQuery({
    queryKey: ['proofs', archiveFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proofs')
        .select('*');
      
      if (error) throw error;
      
      // Filter based on archive status
      if (archiveFilter === 'actives') {
        return data?.filter(proof => !proof.archived_at) || [];
      } else if (archiveFilter === 'archived') {
        return data?.filter(proof => proof.archived_at) || [];
      }
      return data || [];
    },
  });

  const isLoading = clientsLoading || submissionsLoading || ordersLoading || proofsLoading;

  const filteredClients = useMemo(() => {
    if (!clients || !submissions || !orders || !proofs) return [];

    let filtered = [...clients];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        client.business_name.toLowerCase().includes(query) ||
        client.contact_name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Filter by activity
    if (activityFilter !== 'all') {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(client => {
        const clientSubmissions = submissions?.filter(s => s && s.client_id === client.id) || [];
        const clientOrders = orders?.filter(o => o && o.client_id === client.id) || [];
        
        // Get proofs from client orders
        const clientOrderIds = clientOrders.map(o => o.id);
        const clientProofs = proofs?.filter(p => p && clientOrderIds.includes(p.order_id)) || [];

        switch (activityFilter) {
          case 'active_orders':
            // Has orders created in the last 3 months
            return clientOrders.some(order => 
              order.created_at && new Date(order.created_at) > threeMonthsAgo
            );

          case 'active_submissions':
            // Has submissions created in the last 3 months
            return clientSubmissions.some(submission => 
              submission.created_at && new Date(submission.created_at) > threeMonthsAgo
            );

          case 'active_proofs':
            // Has proofs created in the last 3 months
            return clientProofs.some(proof => 
              proof.created_at && new Date(proof.created_at) > threeMonthsAgo
            );

          case 'inactive_orders':
            // Has orders but none created in the last 3 months
            return clientOrders.length > 0 && !clientOrders.some(order => 
              order.created_at && new Date(order.created_at) > threeMonthsAgo
            );

          case 'inactive_submissions':
            // Has submissions but none created in the last 3 months
            return clientSubmissions.length > 0 && !clientSubmissions.some(submission => 
              submission.created_at && new Date(submission.created_at) > threeMonthsAgo
            );

          default:
            return true;
        }
      });
    }

    return filtered;
  }, [clients, submissions, orders, proofs, searchQuery, statusFilter, activityFilter]);

  return {
    clients: filteredClients,
    isLoading,
    error: clientsError,
    totalCount: clients?.length || 0,
    filteredCount: filteredClients.length,
  };
};