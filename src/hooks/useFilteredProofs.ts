import { useMemo } from 'react';
import { useAllProofs } from './useAllProofs';

export const useFilteredProofs = (
  searchQuery: string,
  statusFilter: string,
  periodFilter: string,
  includeArchived: boolean = false
) => {
  const { data: proofs, isLoading, error } = useAllProofs();

  const filteredProofs = useMemo(() => {
    if (!proofs || !Array.isArray(proofs)) return [];

    let filtered = [...proofs];

    // Filter by archived status FIRST
    if (!includeArchived) {
      filtered = filtered.filter(proof => 
        !proof.archived_at && !proof.is_archived
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(proof => {
        const orders = proof.orders as any;
        return proof.human_id?.toLowerCase().includes(query) ||
               orders?.order_number?.toLowerCase().includes(query) ||
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
  }, [proofs, searchQuery, statusFilter, periodFilter, includeArchived]);

  return {
    proofs: filteredProofs,
    isLoading,
    error,
    totalCount: proofs?.length || 0,
    filteredCount: filteredProofs.length,
  };
};