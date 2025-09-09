import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Submission, SubmissionFilters, DashboardStats } from '@/types/submission';
import { useToast } from '@/hooks/use-toast';

export const useSubmissionsData = (filters: SubmissionFilters) => {
  return useQuery({
    queryKey: ['submissions', filters],
    queryFn: async (): Promise<Submission[]> => {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          clients (
            business_name,
            contact_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Apply basic filters only
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform and filter data
      const transformedData: Submission[] = (data || [])
        .filter((item: any) => !item.is_archived) // Filter archived
        .map((item: any) => ({
          id: item.id,
          submission_number: item.submission_number,
          client_id: item.client_id,
          sent_at: item.sent_at ? new Date(item.sent_at) : null,
          deadline: item.deadline ? new Date(item.deadline) : null,
          total_price: item.total_price || 0,
          status: item.status,
          priority: (item.priority || 'normal') as any,
          is_archived: item.is_archived || false,
          assigned_to: item.assigned_to,
          approval_token: item.approval_token,
          tags: item.tags,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at),
          clients: item.clients ? {
            business_name: item.clients.business_name,
            contact_name: item.clients.contact_name,
            contact_email: item.clients.email,
          } : undefined,
        }));
      
      // Client-side search filtering
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return transformedData.filter(submission => 
          submission.submission_number?.toLowerCase().includes(searchLower) ||
          submission.clients?.business_name?.toLowerCase().includes(searchLower) ||
          submission.clients?.contact_name?.toLowerCase().includes(searchLower)
        );
      }

      return transformedData;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useDashboardStats = (): { data: DashboardStats | undefined; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data, error } = await supabase
        .from('submissions')
        .select('status, total_price');

      if (error) throw error;

      const stats = (data || []).reduce(
        (acc: DashboardStats, submission: any) => {
          acc.total++;
          if (submission.status === 'accepted') acc.accepted++;
          if (submission.status === 'sent') acc.sent++;
          if (['accepted', 'rejected'].includes(submission.status)) acc.completed++;
          acc.totalValue += submission.total_price || 0;
          return acc;
        },
        { total: 0, completed: 0, accepted: 0, sent: 0, totalValue: 0 }
      );

      return stats;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return { data, isLoading };
};

export const useBulkActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase
        .from('submissions')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Statut mis à jour',
        description: `${variables.ids.length} soumission(s) mise(s) à jour avec succès.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut.',
        variant: 'destructive',
      });
    },
  });

  // Assignation supprimée

  const archiveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('submissions')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Archivage réussi',
        description: `${ids.length} soumission(s) archivée(s) avec succès.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'archiver les soumissions.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Suppression réussie',
        description: `${ids.length} soumission(s) supprimée(s) avec succès.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les soumissions.',
        variant: 'destructive',
      });
    },
  });

  return {
    updateStatus: updateStatusMutation.mutate,
    archive: archiveMutation.mutate,
    delete: deleteMutation.mutate,
    isLoading: updateStatusMutation.isPending || 
               archiveMutation.isPending || 
               deleteMutation.isPending,
  };
};