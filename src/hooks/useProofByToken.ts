import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProofByToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ['proof-by-token', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Token is required');
      }

      console.log('Fetching proof with token:', token);

      // Find any proof with this approval token to get the order_id
      const { data: tokenProof, error: tokenError } = await supabase
        .from('proofs')
        .select('order_id, id')
        .eq('approval_token', token)
        .single();

      if (tokenError || !tokenProof) {
        console.error('Token not found:', tokenError);
        throw new Error('Token invalide ou épreuve non trouvée');
      }

      console.log('Token found for order:', tokenProof.order_id);

      // Get the latest proof version for this order
      const { data: latestProof, error: proofError } = await supabase
        .from('proofs')
        .select(`
          id,
          status,
          file_url,
          version,
          client_comments,
          approved_at,
          approved_by_name,
          created_at,
          order_id,
          approval_token,
          orders (
            order_number,
            total_price,
            submission_id,
            submissions (
              submission_number,
              client_id,
              clients (
                business_name,
                contact_name,
                email
              )
            )
          )
        `)
        .eq('order_id', tokenProof.order_id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (proofError || !latestProof) {
        console.error('Latest proof not found:', proofError);
        throw new Error('Dernière version de l\'épreuve non trouvée');
      }

      // Get all proof comments from previous versions for this order
      const { data: proofHistory, error: historyError } = await supabase
        .from('proofs')
        .select(`
          id,
          version,
          status,
          client_comments,
          approved_at,
          approved_by_name,
          created_at
        `)
        .eq('order_id', tokenProof.order_id)
        .not('client_comments', 'is', null)
        .neq('client_comments', '')
        .order('version', { ascending: false });

      // Get order history for this proof
      const { data: orderHistory, error: orderHistoryError } = await supabase
        .from('v_ordre_historique')
        .select('*')
        .eq('order_id', tokenProof.order_id)
        .order('created_at', { ascending: false });

      console.log('Latest proof found successfully, version:', latestProof.version);

      return {
        proof: latestProof,
        proofHistory: proofHistory || [],
        orderHistory: orderHistory || []
      };
    },
    enabled: !!token,
    retry: 1,
  });
};