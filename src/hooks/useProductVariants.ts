import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProductVariants = (productId?: string) => {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('attribute_name')
        .order('attribute_value');

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
};