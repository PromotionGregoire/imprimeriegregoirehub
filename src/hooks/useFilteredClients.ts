import { useMemo } from 'react';
import { useClients } from './useClients';

export const useFilteredClients = (
  searchQuery: string,
  statusFilter: string,
  periodFilter: string
) => {
  const { data: clients, isLoading, error } = useClients();

  const filteredClients = useMemo(() => {
    if (!clients) return [];

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

    // Filter by period
    if (periodFilter !== 'all') {
      const now = new Date();
      const days = parseInt(periodFilter.replace('days', ''));
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(client => 
        new Date(client.created_at) >= cutoffDate
      );
    }

    return filtered;
  }, [clients, searchQuery, statusFilter, periodFilter]);

  return {
    clients: filteredClients,
    isLoading,
    error,
    totalCount: clients?.length || 0,
    filteredCount: filteredClients.length,
  };
};