import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name');

      if (error) {
        throw error;
      }

      return data as Profile[];
    },
  });
};

interface ClientFormData {
  business_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  main_contact_position?: string;
  secondary_contact_info?: string;
  billing_street?: string;
  billing_city?: string;
  billing_province?: string;
  billing_postal_code?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_postal_code?: string;
  tax_numbers?: string;
  default_payment_terms?: string;
  client_type?: string;
  industry?: string;
  lead_source?: string;
  status?: string;
  assigned_user_id?: string;
  general_notes?: string;
}

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData: ClientFormData) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};