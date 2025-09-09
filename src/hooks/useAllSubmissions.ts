import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArchiveFilter, getTableNameByFilter } from '@/utils/archiveUtils';

export const useAllSubmissions = (archiveFilter: ArchiveFilter = 'actives') => {
  return useQuery({
    queryKey: ['all-submissions', archiveFilter],
    queryFn: async () => {
      const tableName = getTableNameByFilter('submissions', archiveFilter);
      
      const { data, error } = await supabase
        .from(tableName as any)
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
      return data;
    },
  });
};