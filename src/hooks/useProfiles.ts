import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      // If user is not authenticated yet (e.g., on login screen), use an edge function
      // to fetch the minimal list of employees with service role (RLS-safe).
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        const { data, error } = await supabase.functions.invoke(
          'get-employees-for-login'
        );
        if (error) throw error;
        return data as Array<{ id: string; full_name: string; role: string; email: string | null }>;
      }

      // If authenticated, read directly with RLS policies
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, email')
        .order('full_name');

      if (error) {
        throw error;
      }

      return data;
    },
  });
};