import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Package, DollarSign, Tag, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useProduct } from '@/hooks/useProduct';
import { useUpdateProduct } from '@/hooks/useProducts';
import { useProductVariants } from '@/hooks/useProductVariants';
import { useIsMobile } from '@/hooks/use-mobile';
import ProductModal from '@/components/ProductModal';

// Lazy load des composants lourds
const ProductVariantManager = lazy(() => import('@/components/ProductVariantManager'));
const ProductSuppliersManager = lazy(() => import('@/components/ProductSuppliersManager'));

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState('info');
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const { data: product, isLoading: productLoading } = useProduct(id);
  const { data: variants, isLoading: variantsLoading } = useProductVariants(id || '');
  const updateProduct = useUpdateProduct();
  
  const handleSaveProduct = (data: any) => {
    if (!product?.id) return;
    
    updateProduct.mutate({ id: product.id, updates: data }, {
      onSuccess: () => {
        toast({
          title: '✅ Succès',
          description: 'Produit mis à jour avec succès.',
        });
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
  };
  
  if (productLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Produit non trouvé</h2>
          <p className="text-muted-foreground mb-4">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate('/dashboard/products')}>
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant={category === 'Impression' ? 'default' : 'secondary'}>
        {category}
      </Badge>
    );
  };

  if (isMobile) {
    return (
      <>
        <div className="p-4 space-y-4">
          {/* Mobile Header */}
          <div className="flex items-center gap-3 pb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/products')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{product.name}</h1>
              <p className="text-sm text-muted-foreground">{product.product_code}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditModalOpen(true)}
              className="shrink-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Product Summary Card */}
          <Card className="rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-medium">{product.name}</span>
                </div>
                {getCategoryBadge(product.category)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    ${Number(product.default_price).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Prix par défaut</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {variantsLoading ? '...' : variants?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Variantes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Description */}
          {product.description && (
            <Card className="rounded-lg">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Mobile Variants */}
          {variants && variants.length > 0 && (
            <Card className="rounded-lg">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Variantes disponibles</h3>
                <div className="space-y-3">
                  {Object.entries(
                    variants.reduce((groups, variant) => {
                      const key = variant.attribute_name;
                      if (!groups[key]) {
                        groups[key] = [];
                      }
                      groups[key].push(variant);
                      return groups;
                    }, {} as Record<string, any[]>)
                  ).map(([attributeName, attributeVariants]) => (
                    <div key={attributeName}>
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        {attributeName}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {attributeVariants.map((variant) => (
                          <Badge key={variant.id} variant="outline" className="text-xs">
                            {variant.attribute_value}
                            {variant.cost_price > 0 && (
                              <span className="ml-1 text-muted-foreground">
                                ${variant.cost_price}
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        <ProductModal
          product={product}
          onSave={handleSaveProduct}
          isLoading={updateProduct.isPending}
          isOpen={editModalOpen}
          onOpenChange={setEditModalOpen}
        />
      </>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/products')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">{product.product_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getCategoryBadge(product.category)}
            <Button onClick={() => setEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prix par défaut</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Number(product.default_price).toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Variantes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {variantsLoading ? '...' : variants?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catégorie</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{product.category}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Informations détaillées</TabsTrigger>
            <TabsTrigger value="variants">Variantes</TabsTrigger>
            <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du produit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nom</label>
                    <p className="text-base">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Code produit</label>
                    <p className="text-base">{product.product_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
                    <p className="text-base">{product.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prix par défaut</label>
                    <p className="text-base">${Number(product.default_price).toFixed(2)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-base">{product.description || 'Aucune description'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variantes section */}
            {variants && variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Variantes disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      variants.reduce((groups, variant) => {
                        const key = variant.attribute_name;
                        if (!groups[key]) {
                          groups[key] = [];
                        }
                        groups[key].push(variant);
                        return groups;
                      }, {} as Record<string, any[]>)
                    ).map(([attributeName, attributeVariants]) => (
                      <div key={attributeName}>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          {attributeName}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {attributeVariants.map((variant) => (
                            <Badge key={variant.id} variant="outline">
                              {variant.attribute_value}
                              {variant.cost_price > 0 && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  (${variant.cost_price})
                                </span>
                              )}
                              {variant.sku_variant && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  - {variant.sku_variant}
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="variants" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-32" />}>
              <ProductVariantManager productId={id!} />
            </Suspense>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-32" />}>
              <ProductSuppliersManager productId={id!} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      <ProductModal
        product={product}
        onSave={handleSaveProduct}
        isLoading={updateProduct.isPending}
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </>
  );
};

export default ProductDetails;