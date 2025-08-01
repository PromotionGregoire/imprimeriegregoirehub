import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Edit, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProducts } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useSuppliers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProductVariantManager from './ProductVariantManager';
import ProductSuppliersManager from './ProductSuppliersManager';

const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  product_code: z.string().optional(),
  description: z.string().optional(),
  default_price: z.number().min(0, 'Le prix doit être positif'),
  category: z.enum(['Impression', 'Article Promotionnel']),
  supplier_ids: z.array(z.string()).optional(),
  image_url: z.string().optional(),
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
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  
  const { data: suppliers } = useSuppliers();
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      product_code: '',
      description: '',
      default_price: 0,
      category: 'Impression',
      supplier_ids: [],
      image_url: '',
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
        supplier_ids: [],
        image_url: (product as any).image_url || '',
      });
      setImagePreview((product as any).image_url || '');
    } else if (!product && isOpen) {
      form.reset({
        name: '',
        product_code: '',
        description: '',
        default_price: 0,
        category: 'Impression',
        supplier_ids: [],
        image_url: '',
      });
      setSelectedSuppliers([]);
      setSelectedImage(null);
      setImagePreview('');
    }
  }, [product, isOpen, form]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "L'image ne doit pas dépasser 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Type de fichier invalide",
          description: "Veuillez sélectionner une image.",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        toast({
          title: "Erreur d'upload",
          description: "Impossible de téléverser l'image.",
          variant: "destructive",
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    // If there's an existing image URL, optionally delete it from storage
    if (form.getValues('image_url') && form.getValues('image_url').includes('product-images')) {
      try {
        const imagePath = form.getValues('image_url').split('/product-images/')[1];
        if (imagePath) {
          await supabase.storage
            .from('product-images')
            .remove([imagePath]);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    setSelectedImage(null);
    setImagePreview('');
    form.setValue('image_url', '');
  };

  const handleSubmit = async (data: ProductFormData) => {
    let imageUrl = data.image_url;

    // Upload image if a new one was selected
    if (selectedImage) {
      const uploadedUrl = await uploadImageToStorage(selectedImage);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        // Update the form field with the new URL
        form.setValue('image_url', imageUrl);
        // Update preview to show the uploaded image
        setImagePreview(imageUrl);
      } else {
        // Upload failed, don't proceed
        return;
      }
    }

    const submitData = {
      ...data,
      image_url: imageUrl,
      supplier_ids: selectedSuppliers,
    };
    
    // Call onSave with the updated data
    onSave(submitData);
    
    // Reset the selected image after successful upload
    if (selectedImage) {
      setSelectedImage(null);
    }
    
    // Close modal for new products only (edit modal closure is handled by parent)
    if (!isLoading && !product) {
      setIsOpen(false);
      setSelectedImage(null);
      setImagePreview('');
    }
  };

  const handleVariantsChange = (newVariants: any[]) => {
    setVariants(newVariants);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl h-[95vh] max-h-[800px] flex flex-col p-0 gap-0">
        <div className="p-6 border-b flex-shrink-0">
          <DialogHeader>
            <DialogTitle>
              {product ? 'Modifier le produit' : 'Créer un nouveau produit'}
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
        
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
                    <FormLabel>Code produit</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sera généré automatiquement si vide" />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour génération automatique
                    </p>
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

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Image du produit</Label>
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative w-32 h-24 border rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/30">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      asChild
                      disabled={isUploading}
                    >
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'Upload en cours...' : 'Choisir une image'}
                      </label>
                    </Button>
                    {imagePreview && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés: JPG, PNG, GIF (max 5MB)
                  </p>
                  {isUploading && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      Upload en cours...
                    </p>
                  )}
                </div>
              </div>
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

            {/* Fournisseurs associés pour nouveau produit */}
            {!product && suppliers && suppliers.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Fournisseurs Associés</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`supplier-${supplier.id}`}
                        checked={selectedSuppliers.includes(supplier.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSuppliers(prev => [...prev, supplier.id]);
                          } else {
                            setSelectedSuppliers(prev => prev.filter(id => id !== supplier.id));
                          }
                        }}
                        className="rounded border-input"
                      />
                      <Label htmlFor={`supplier-${supplier.id}`} className="text-sm">
                        {supplier.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading || isUploading 
                  ? (isUploading ? 'Upload...' : 'Sauvegarde...') 
                  : (product ? 'Mettre à jour' : 'Créer')
                }
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;