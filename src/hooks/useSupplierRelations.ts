import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook pour les liaisons produit-fournisseur
export const useProductSuppliers = (productId?: string) => {
  return useQuery({
    queryKey: ['product-suppliers', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_suppliers')
        .select(`
          *,
          suppliers (
            id,
            name,
            is_goods_supplier,
            is_service_supplier
          )
        `)
        .eq('product_id', productId);

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
};

// Hook pour les catégories d'un fournisseur
export const useSupplierCategories = (supplierId?: string) => {
  return useQuery({
    queryKey: ['supplier-categories', supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      
      const { data, error } = await supabase
        .from('supplier_categories')
        .select('*')
        .eq('supplier_id', supplierId);

      if (error) throw error;
      return data;
    },
    enabled: !!supplierId,
  });
};

// Hook pour les mutations
export const useSupplierRelationMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const linkProductToSupplier = useMutation({
    mutationFn: async ({ productId, supplierId }: { productId: string; supplierId: string }) => {
      const { data, error } = await supabase
        .from('product_suppliers')
        .insert([{ product_id: productId, supplier_id: supplierId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers'] });
    },
  });

  const unlinkProductFromSupplier = useMutation({
    mutationFn: async ({ productId, supplierId }: { productId: string; supplierId: string }) => {
      const { error } = await supabase
        .from('product_suppliers')
        .delete()
        .eq('product_id', productId)
        .eq('supplier_id', supplierId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers'] });
    },
  });

  const addSupplierCategory = useMutation({
    mutationFn: async ({ supplierId, categoryName }: { supplierId: string; categoryName: string }) => {
      const { data, error } = await supabase
        .from('supplier_categories')
        .insert([{ supplier_id: supplierId, category_name: categoryName }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-categories'] });
      toast({
        title: '✅ Catégorie ajoutée',
        description: 'La spécialité a été associée au fournisseur.',
      });
    },
  });

  const removeSupplierCategory = useMutation({
    mutationFn: async ({ supplierId, categoryName }: { supplierId: string; categoryName: string }) => {
      const { error } = await supabase
        .from('supplier_categories')
        .delete()
        .eq('supplier_id', supplierId)
        .eq('category_name', categoryName);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-categories'] });
      toast({
        title: '✅ Catégorie supprimée',
        description: 'La spécialité a été retirée du fournisseur.',
      });
    },
  });

  return {
    linkProductToSupplier,
    unlinkProductFromSupplier,
    addSupplierCategory,
    removeSupplierCategory,
  };
};