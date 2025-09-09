import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArchiveFilter } from '@/utils/archiveUtils';

export const useAllSubmissions = (archiveFilter: ArchiveFilter = 'actives') => {
  return useQuery({
    queryKey: ['all-submissions', archiveFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          clients (
            business_name,
            contact_name,
            email,
            assigned_user_id,
            profiles (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter based on archive status
      if (archiveFilter === 'actives') {
        return data?.filter(submission => !submission.archived_at) || [];
      } else if (archiveFilter === 'archived') {
        return data?.filter(submission => submission.archived_at) || [];
      }
      return data || [];
    },
  });
};