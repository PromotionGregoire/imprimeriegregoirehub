import { useMemo } from 'react';
import { useProofs } from './useProofs';

export const useFilteredProofs = (
  searchQuery: string,
  statusFilter: string,
  periodFilter: string
) => {
  const { data: proofs, isLoading, error } = useProofs();

  const filteredProofs = useMemo(() => {
    if (!proofs || !Array.isArray(proofs)) return [];

    let filtered = [...proofs];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(proof => {
        const orders = proof.orders as any;
        return orders?.order_number?.toLowerCase().includes(query) ||
               orders?.clients?.business_name?.toLowerCase().includes(query);
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proof => proof.status === statusFilter);
    }

    // Filter by period
    if (periodFilter !== 'all') {
      const now = new Date();
      const days = parseInt(periodFilter.replace('days', ''));
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(proof => 
        new Date(proof.created_at) >= cutoffDate
      );
    }

    return filtered;
  }, [proofs, searchQuery, statusFilter, periodFilter]);

  return {
    proofs: filteredProofs,
    isLoading,
    error,
    totalCount: proofs?.length || 0,
    filteredCount: filteredProofs.length,
  };
};