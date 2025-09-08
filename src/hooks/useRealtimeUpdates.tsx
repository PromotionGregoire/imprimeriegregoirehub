import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useRealtimeUpdates(userId: string) {
  const { toast } = useToast();

  useEffect(() => {
    const submissionsChannel = supabase
      .channel('submissions_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'submissions', 
        filter: `created_by=eq.${userId}` 
      }, (payload) => {
        const newSubmission = (payload as any).new;
        const oldSubmission = (payload as any).old;
        
        if (newSubmission?.status !== oldSubmission?.status) {
          toast({
            title: 'Soumission mise à jour',
            description: `Statut changé : ${newSubmission.status}`,
            variant: newSubmission.status === 'Approuvée' ? 'default' : 'destructive'
          });
        }
      })
      .subscribe();

    const proofsChannel = supabase
      .channel('proofs_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'proofs' 
      }, (payload) => {
        toast({
          title: 'Nouveau BAT disponible',
          description: 'Un nouveau BAT a été ajouté à une de vos commandes'
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(proofsChannel);
    };
  }, [userId, toast]);
}