import { useMutation, useQueryClient } from '@tanstack/react-query';
import { archiveEntity, unarchiveEntity, ArchiveEntityKind } from '@/utils/archiveUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useArchiveMutations(kind: ArchiveEntityKind) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const archiveMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      await archiveEntity(kind, id, reason, user?.id);
    },
    onSuccess: () => {
      const entityName = 
        kind === 'submission' ? 'soumission' :
        kind === 'order'      ? 'commande'   :
                                'épreuve';
      
      toast({
        title: '✅ Archivage réussi',
        description: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} archivée avec succès`
      });
      
      // Invalider toutes les queries liées à cette entité
      queryClient.invalidateQueries({ queryKey: [kind === 'submission' ? 'all-submissions' : kind === 'order' ? 'orders' : 'proofs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (error) => {
      console.error('Erreur lors de l\'archivage:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'archiver cet élément',
        variant: 'destructive'
      });
    }
  });

  const unarchiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await unarchiveEntity(kind, id);
    },
    onSuccess: () => {
      const entityName = 
        kind === 'submission' ? 'soumission' :
        kind === 'order'      ? 'commande'   :
                                'épreuve';
      
      toast({
        title: '✅ Désarchivage réussi',
        description: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} désarchivée avec succès`
      });
      
      // Invalider toutes les queries liées à cette entité
      queryClient.invalidateQueries({ queryKey: [kind === 'submission' ? 'all-submissions' : kind === 'order' ? 'orders' : 'proofs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (error) => {
      console.error('Erreur lors du désarchivage:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de désarchiver cet élément',
        variant: 'destructive'
      });
    }
  });

  return {
    archiveMutation,
    unarchiveMutation
  };
}