import { supabase } from '@/integrations/supabase/client';

export const createBusinessCardsProducts = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('add-business-cards-products', {
      body: {}
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating business cards products:', error);
    throw error;
  }
};