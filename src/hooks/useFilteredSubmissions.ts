import { useMemo } from 'react';
import { useAllSubmissions } from './useAllSubmissions';

export const useFilteredSubmissions = (
  searchQuery: string,
  statusFilter: string,
  periodFilter: string
) => {
  const { data: submissions, isLoading, error } = useAllSubmissions();

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];

    let filtered = [...submissions];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(submission =>
        submission.submission_number.toLowerCase().includes(query) ||
        submission.clients?.business_name.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Filter by period
    if (periodFilter !== 'all') {
      const now = new Date();
      const days = parseInt(periodFilter.replace('days', ''));
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(submission => 
        new Date(submission.created_at) >= cutoffDate
      );
    }

    return filtered;
  }, [submissions, searchQuery, statusFilter, periodFilter]);

  return {
    submissions: filteredSubmissions,
    isLoading,
    error,
    totalCount: submissions?.length || 0,
    filteredCount: filteredSubmissions.length,
  };
};