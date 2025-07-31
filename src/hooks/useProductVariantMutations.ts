import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProductVariantMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createVariant = useMutation({
    mutationFn: async (variantData: any) => {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([variantData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', data.product_id] });
      toast({
        title: '✅ Variante créée',
        description: 'La variante de produit a été ajoutée avec succès.',
      });
    },
    onError: (error) => {
      console.error('Error creating product variant:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de créer la variante de produit.',
        variant: 'destructive',
      });
    },
  });

  const updateVariant = useMutation({
    mutationFn: async ({ variantId, updates }: { variantId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', variantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast({
        title: '✅ Variante modifiée',
        description: 'La variante a été mise à jour avec succès.',
      });
    },
    onError: (error) => {
      console.error('Error updating product variant:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de modifier la variante.',
        variant: 'destructive',
      });
    },
  });

  const deleteVariant = useMutation({
    mutationFn: async (variantId: string) => {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast({
        title: '✅ Variante supprimée',
        description: 'La variante a été supprimée avec succès.',
      });
    },
    onError: (error) => {
      console.error('Error deleting product variant:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de supprimer la variante.',
        variant: 'destructive',
      });
    },
  });

  const createMultipleVariants = useMutation({
    mutationFn: async ({ productId, variants }: { productId: string; variants: any[] }) => {
      const { data, error } = await supabase
        .from('product_variants')
        .insert(variants.map(v => ({ ...v, product_id: productId })))
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast({
        title: '✅ Variantes créées',
        description: 'Toutes les variantes ont été créées avec succès.',
      });
    },
    onError: (error) => {
      console.error('Error creating multiple variants:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de créer les variantes.',
        variant: 'destructive',
      });
    },
  });

  return {
    createVariant,
    updateVariant,
    deleteVariant,
    createMultipleVariants,
  };
};