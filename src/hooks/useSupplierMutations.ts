import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupplierMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSupplier = useMutation({
    mutationFn: async (supplierData: any) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: '✅ Fournisseur créé',
        description: 'Le fournisseur a été ajouté avec succès.',
      });
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de créer le fournisseur.',
        variant: 'destructive',
      });
    },
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: '✅ Fournisseur mis à jour',
        description: 'Les modifications ont été sauvegardées.',
      });
    },
    onError: (error) => {
      console.error('Error updating supplier:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de mettre à jour le fournisseur.',
        variant: 'destructive',
      });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: '✅ Fournisseur supprimé',
        description: 'Le fournisseur a été supprimé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Error deleting supplier:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de supprimer le fournisseur.',
        variant: 'destructive',
      });
    },
  });

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};