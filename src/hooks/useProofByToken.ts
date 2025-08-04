import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProofByToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ['proof-by-token', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Token is required');
      }

      // Utiliser GET avec le token en paramètre
      const response = await fetch(
        `https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/get-proof-by-token?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération de l\'épreuve');
      }

      const data = await response.json();
      return data;
    },
    enabled: !!token,
    retry: 1,
  });
};