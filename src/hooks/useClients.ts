import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Client {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  client_number: string;
  created_at: string;
  main_contact_position?: string;
  client_type?: string;
  industry?: string;
  status?: string;
  billing_city?: string;
  billing_province?: string;
  assigned_user_id?: string;
}

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Client[];
    },
  });
};