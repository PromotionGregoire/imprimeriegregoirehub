import { useState } from 'react';
import { Search, Pencil, Trash2, Tag, Building, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import ProductModal from '@/components/ProductModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const Products = () => {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const handleCreateProduct = (data: any) => {
    console.log('Creating product with data:', data);
    createProduct.mutate(data, {
      onSuccess: (result) => {
        console.log('Product created successfully:', result);
        toast({
          title: '✅ Produit créé',
          description: 'Le produit a été ajouté avec succès.',
        });
      },
      onError: (error) => {
        console.error('Error creating product:', error);
        toast({
          title: '❌ Erreur',
          description: 'Impossible de créer le produit.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleUpdateProduct = (data: any) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, updates: data }, {
        onSuccess: () => {
          toast({
            title: '✅ Succès',
            description: 'Produit mis à jour avec succès.',
          });
          setEditingProduct(null);
          setEditModalOpen(false);
        },
        onError: (error) => {
          console.error('Error updating product:', error);
          toast({
            title: '❌ Erreur',
            description: 'Impossible de mettre à jour le produit.',
            variant: 'destructive',
          });
        }
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      // Find the product to get its image URL for cleanup
      const productToDelete = products?.find(p => p.id === id);
      
      deleteProduct.mutate(id, {
        onSuccess: async () => {
          // Clean up the image from storage if it exists
          if (productToDelete?.image_url && productToDelete.image_url.includes('product-images')) {
            try {
              const imagePath = productToDelete.image_url.split('/product-images/')[1];
              if (imagePath) {
                await supabase.storage
                  .from('product-images')
                  .remove([imagePath]);
              }
            } catch (error) {
              console.error('Error deleting image from storage:', error);
              // Don't show error to user as the product was deleted successfully
            }
          }
        }
      });
    }
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant={category === 'Impression' ? 'default' : 'secondary'}>
        {category}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[36px] font-semibold leading-tight">Produits</h1>
        </div>
        <div className="grid gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* BaseWeb Layout Container with responsive margins */}
      <div className={cn(
        "mx-auto max-w-7xl",
        "px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8",
        "pb-20 md:pb-8" // Bottom nav spacing
      )}>
        
        {/* Header Section - BaseWeb Typography Scale */}
        <div className={cn(
          "flex flex-col sm:flex-row items-start sm:items-center justify-between",
          "gap-4 mb-8" // Increased from mb-6 to mb-8 for proper spacing
        )}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Tag className="h-6 w-6 text-primary flex-shrink-0" />
            <h1 className={cn(
              "text-[24px] sm:text-[28px] lg:text-[32px] font-semibold leading-tight text-foreground",
              "truncate max-w-full" // Responsive typography + overflow prevention
            )}>
              Produits
            </h1>
          </div>
          {/* BaseWeb Button with 48px touch target */}
          <Button 
            variant="primary"
            size="default"
            className={cn(
              "min-h-[48px] px-4 gap-2",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "transition-all duration-200 ease-out",
              "shadow-sm hover:shadow-md",
              "whitespace-nowrap"
            )}
            onClick={() => setEditModalOpen(true)}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Nouveau Produit</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>

        {/* Search and Filters - BaseWeb Form Pattern */}
        <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom ou code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "pl-10 min-h-[48px] text-[16px] leading-relaxed",
                    "focus:ring-2 focus:ring-primary focus:border-primary"
                  )}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className={cn(
                  "w-full sm:w-[240px] min-h-[48px] text-[16px] leading-relaxed",
                  "focus:ring-2 focus:ring-primary focus:border-primary"
                )}>
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border shadow-lg z-50">
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="Impression">Impression</SelectItem>
                  <SelectItem value="Article Promotionnel">Article Promotionnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products List - Visual Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-background border-border">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center max-w-md mx-auto">
                    <Tag className="h-12 w-12 text-muted-foreground/60 mb-4" />
                    <h3 className="text-[18px] font-medium leading-tight mb-2 text-foreground">
                      Aucun produit trouvé
                    </h3>
                    <p className="text-[16px] leading-relaxed text-muted-foreground text-center">
                      {searchTerm || categoryFilter !== 'all' 
                        ? 'Aucun produit trouvé avec ces critères'
                        : 'Aucun produit pour le moment'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className={cn(
                  "bg-background border-border shadow-sm hover:shadow-lg transition-all duration-200",
                  "cursor-pointer overflow-hidden group hover:border-primary/20",
                  "w-full h-full flex flex-col"
                )}
                onClick={() => window.location.href = `/dashboard/products/${product.id}`}
              >
                {/* Image Section - Fixed Height */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  {product.image_url ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide the image and show fallback
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.nextElementSibling;
                          if (fallback) {
                            fallback.classList.remove('hidden');
                          }
                        }}
                      />
                    </div>
                  ) : null}
                  
                  {/* Fallback color-coded background */}
                  <div className={cn(
                    "w-full h-full flex items-center justify-center",
                    product.image_url ? "hidden" : "",
                    product.category === 'Impression' 
                      ? "bg-emerald-100" 
                      : "bg-blue-100"
                  )}>
                    <div className="text-center">
                      <Tag className={cn(
                        "h-12 w-12 mx-auto mb-2",
                        product.category === 'Impression' 
                          ? "text-emerald-600" 
                          : "text-blue-600"
                      )} />
                      <div className={cn(
                        "text-sm font-medium",
                        product.category === 'Impression' 
                          ? "text-emerald-700" 
                          : "text-blue-700"
                      )}>
                        {product.category}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleEdit(product)}
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                      aria-label="Modifier le produit"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white hover:text-destructive shadow-sm"
                      aria-label="Supprimer le produit"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-2 left-2">
                    <Badge 
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full shadow-sm border",
                        product.category === 'Impression' 
                          ? "bg-emerald-500 text-white border-emerald-600" 
                          : "bg-blue-500 text-white border-blue-600"
                      )}
                    >
                      {product.category}
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-4 flex-1 flex flex-col">
                  {/* Product Code */}
                  <div className="text-xs font-mono text-muted-foreground mb-2 truncate">
                    {product.product_code}
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
                      {product.description}
                    </p>
                  )}

                  {/* Price - Fixed at bottom */}
                  <div className="text-lg font-bold text-foreground mt-auto pt-2">
                    ${Number(product.default_price).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Modal de création/édition contrôlé */}
        <ProductModal
          product={editingProduct}
          onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
          isLoading={editingProduct ? updateProduct.isPending : createProduct.isPending}
          isOpen={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) setEditingProduct(null);
          }}
        />
      </div>
    </div>
  );
};

export default Products;