import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupplierSpecialties = (supplierId?: string) => {
  return useQuery({
    queryKey: ['supplier-specialties', supplierId],
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

export const useSupplierSpecialtyMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addSpecialty = useMutation({
    mutationFn: async ({ supplierId, categoryName, categoryType }: {
      supplierId: string;
      categoryName: string;
      categoryType: 'Bien' | 'Service';
    }) => {
      const { data, error } = await supabase
        .from('supplier_categories')
        .insert([{
          supplier_id: supplierId,
          category_name: categoryName,
          category_type: categoryType
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-specialties'] });
    },
  });

  const removeSpecialty = useMutation({
    mutationFn: async ({ supplierId, categoryName, categoryType }: {
      supplierId: string;
      categoryName: string;
      categoryType: 'Bien' | 'Service';
    }) => {
      const { error } = await supabase
        .from('supplier_categories')
        .delete()
        .eq('supplier_id', supplierId)
        .eq('category_name', categoryName)
        .eq('category_type', categoryType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-specialties'] });
    },
  });

  const updateSupplierSpecialties = useMutation({
    mutationFn: async ({ 
      supplierId, 
      goodsCategories, 
      serviceCategories 
    }: {
      supplierId: string;
      goodsCategories: string[];
      serviceCategories: string[];
    }) => {
      // Remove all existing specialties for this supplier
      await supabase
        .from('supplier_categories')
        .delete()
        .eq('supplier_id', supplierId);

      // Add new specialties
      const newSpecialties = [
        ...goodsCategories.map(cat => ({
          supplier_id: supplierId,
          category_name: cat,
          category_type: 'Bien' as const
        })),
        ...serviceCategories.map(cat => ({
          supplier_id: supplierId,
          category_name: cat,
          category_type: 'Service' as const
        }))
      ];

      if (newSpecialties.length > 0) {
        const { error } = await supabase
          .from('supplier_categories')
          .insert(newSpecialties);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-specialties'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  return {
    addSpecialty,
    removeSpecialty,
    updateSupplierSpecialties,
  };
};