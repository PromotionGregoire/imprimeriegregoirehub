import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProducts } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useSuppliers';
import ProductVariantManager from './ProductVariantManager';
import ProductSuppliersManager from './ProductSuppliersManager';

const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  product_code: z.string().min(1, 'Le code produit est requis'),
  description: z.string().optional(),
  default_price: z.number().min(0, 'Le prix doit être positif'),
  category: z.enum(['Impression', 'Article Promotionnel']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  trigger?: React.ReactNode;
  product?: any;
  onSave: (data: ProductFormData) => void;
  isLoading?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProductModal = ({ trigger, product, onSave, isLoading, isOpen: controlledOpen, onOpenChange }: ProductModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const [variants, setVariants] = useState<any[]>([]);
  
  const { data: suppliers } = useSuppliers();
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      product_code: '',
      description: '',
      default_price: 0,
      category: 'Impression',
    },
  });

  useEffect(() => {
    if (product && isOpen) {
      form.reset({
        name: product.name || '',
        product_code: product.product_code || '',
        description: product.description || '',
        default_price: product.default_price || 0,
        category: product.category || 'Impression',
      });
    } else if (!product && isOpen) {
      form.reset({
        name: '',
        product_code: '',
        description: '',
        default_price: 0,
        category: 'Impression',
      });
    }
  }, [product, isOpen, form]);

  const handleSubmit = (data: ProductFormData) => {
    onSave(data);
    if (!isLoading) {
      setIsOpen(false);
    }
  };

  const handleVariantsChange = (newVariants: any[]) => {
    setVariants(newVariants);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Produit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Modifier le produit' : 'Créer un nouveau produit'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du produit *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: T-shirt promotionnel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code produit *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: TSH-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Impression">Impression</SelectItem>
                        <SelectItem value="Article Promotionnel">Article Promotionnel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix par défaut *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Description du produit..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gestionnaire de fournisseurs pour produit existant */}
            {product?.id && (
              <div className="space-y-4">
                <ProductSuppliersManager 
                  productId={product.id}
                  productCategory={product.category}
                />
              </div>
            )}

            {/* Product Variants Manager */}
            {product?.id && (
              <div className="space-y-4">
                <ProductVariantManager 
                  productId={product.id}
                  onVariantsChange={handleVariantsChange}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sauvegarde...' : (product ? 'Mettre à jour' : 'Créer')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;