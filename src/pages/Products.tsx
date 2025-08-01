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
          setEditingProduct(null);
          setEditModalOpen(false);
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
      deleteProduct.mutate(id);
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
          "gap-4 mb-6"
        )}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Tag className="h-6 w-6 text-primary flex-shrink-0" />
            <h1 className={cn(
              "text-[36px] font-semibold leading-tight text-foreground",
              "truncate" // Prevent overflow
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
        <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
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

        {/* Products List - BaseWeb Layout Grid */}
        <div className="space-y-2">
          {filteredProducts.length === 0 ? (
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
          ) : (
            filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className={cn(
                  "bg-background border-border shadow-sm hover:shadow-md transition-all duration-200",
                  "cursor-pointer overflow-hidden"
                )}
                onClick={() => window.location.href = `/dashboard/products/${product.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between min-w-0 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[18px] font-medium leading-tight text-foreground mb-1 truncate">
                        {product.name}
                      </div>
                      <div className="text-[14px] text-muted-foreground leading-tight mb-2">
                        {product.product_code}
                      </div>
                      {product.description && (
                        <div className="text-[14px] text-muted-foreground leading-tight truncate">
                          {product.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-[18px] font-semibold text-foreground">
                          ${Number(product.default_price).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={product.category === 'Impression' ? 'default' : 'secondary'}>
                          {product.category}
                        </Badge>
                        
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 p-0 hover:bg-muted/50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
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