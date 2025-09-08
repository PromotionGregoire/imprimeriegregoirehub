import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';
import { ToastAction } from '@/components/ui/toast';

const SUBMISSION_STATUS = {
  PENDING: "En attente d'approbation",
  APPROVED: "Approuvée", 
  REJECTED: "Rejetée",
} as const;

export function useRealtimeUpdates(userId: string) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clientIds, setClientIds] = useState<string[] | null>(null);
  const channelsRef = useRef<{ submissions?: any; proofs?: any }>({});

  // 1) Charger les clients assignés à l'utilisateur
  useEffect(() => {
    let abort = false;
    (async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('assigned_user_id', userId);
      if (!abort) setClientIds(error ? [] : (data ?? []).map(c => c.id));
    })();
    return () => { abort = true; };
  }, [userId]);

  // 2) S'abonner aux changements lorsqu'on connaît les clients
  useEffect(() => {
    // Nettoyage si on réinitialise
    if (channelsRef.current.submissions) supabase.removeChannel(channelsRef.current.submissions);
    if (channelsRef.current.proofs) supabase.removeChannel(channelsRef.current.proofs);

    if (!clientIds) return; // en attente

    // Construire le filtre IN si on a des clients; sinon, on n'écoute pas
    const subFilter = clientIds.length
      ? `client_id=in.(${clientIds.join(',')})`
      : 'client_id=in.(00000000-0000-0000-0000-000000000000)'; // filtre impossible => silence

    // Soumissions (UPDATE)
    const submissionsChannel = supabase
      .channel(`submissions_changes_${userId}`)
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions',
          filter: subFilter,
        },
        (payload) => {
          const { new: newSub, old: oldSub } = payload as any;
          if (!newSub || !oldSub) return;
          if (newSub.status !== oldSub.status) {
            toast({
              title: 'Soumission mise à jour',
              description: `Statut changé : ${newSub.status}`,
              variant: newSub.status === SUBMISSION_STATUS.APPROVED ? 'default' : 'destructive',
            });
          }
        }
      )
      .subscribe();

    // Proofs (INSERT) — on restreint au minimum à l'auteur si dispo
    const proofsChannel = supabase
      .channel(`proofs_changes_${userId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'proofs',
          // Si tu veux encore mieux filtrer : `uploaded_by=eq.${userId}`
        },
        (payload) => {
          // Ici, si tu veux filtrer par ordre/clients assignés, fais un GET sur orders/submissions pour vérifier.
          toast({
            title: 'Nouveau BAT disponible',
            description: 'Un nouveau BAT a été ajouté à une de vos commandes',
            action: (
              <ToastAction 
                altText="Voir le BAT" 
                onClick={() => navigate(`/proofs/${(payload as any).new.id}`)}
              >
                Voir
              </ToastAction>
            ),
          });
        }
      )
      .subscribe();

    channelsRef.current = { submissions: submissionsChannel, proofs: proofsChannel };

    return () => {
      if (channelsRef.current.submissions) supabase.removeChannel(channelsRef.current.submissions);
      if (channelsRef.current.proofs) supabase.removeChannel(channelsRef.current.proofs);
    };
  }, [clientIds, toast, navigate, userId]);
}