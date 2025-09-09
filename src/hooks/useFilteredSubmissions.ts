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
        submission?.submission_number?.toLowerCase().includes(query) ||
        submission?.clients?.business_name?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission?.status === statusFilter);
    }

    // Filter by period
    if (periodFilter !== 'all') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      switch (periodFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
          break;
        case 'thisWeek':
          const dayOfWeek = now.getDay();
          const daysToSunday = dayOfWeek === 0 ? 0 : dayOfWeek;
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSunday);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - daysToSunday), 23, 59, 59);
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          break;
        case 'lastYear':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
          break;
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '14days':
          startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case '6months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        case '12months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(submission => {
        if (!submission?.created_at) return false;
        const submissionDate = new Date(submission.created_at);
        return submissionDate >= startDate && submissionDate <= endDate;
      });
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