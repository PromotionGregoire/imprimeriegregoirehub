import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProofByToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ['proof-by-token', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Token is required');
      }

      console.log('Fetching proof with token via secure edge function:', token);

      // Use the secure edge function instead of direct database access
      const url = new URL('https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/get-proof-by-token');
      url.searchParams.set('token', token);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3JwbHNpc3RzeGZheGtmcXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODMwNjcsImV4cCI6MjA2OTQ1OTA2N30.rzKPK9GPPOUbZvTaqequy7KK2pBwG7wvxBAfAW-rwoE`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération de l\'épreuve');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération de l\'épreuve');
      }

      console.log('Proof fetched successfully via secure function');

      return {
        proof: result.proof,
        proofHistory: result.proofHistory || [],
        orderHistory: result.orderHistory || []
      };
    },
    enabled: !!token,
    retry: 1,
  });
};