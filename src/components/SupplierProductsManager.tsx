import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useProductSuppliers } from '@/hooks/useSupplierRelations';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useSupplierRelationMutations } from '@/hooks/useSupplierRelations';
import { useToast } from '@/hooks/use-toast';
import ProductModal from './ProductModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface SupplierProductsManagerProps {
  supplierId: string;
  supplierName: string;
}

const SupplierProductsManager = ({ supplierId, supplierName }: SupplierProductsManagerProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { data: productSuppliers, isLoading } = useProductSuppliers();
  const { data: allProducts } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { linkProductToSupplier, unlinkProductFromSupplier } = useSupplierRelationMutations();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filtrer les produits associés à ce fournisseur
  const supplierProducts = productSuppliers?.filter(ps => ps.supplier_id === supplierId) || [];
  const products = supplierProducts.map(ps => 
    allProducts?.find(p => p.id === ps.product_id)
  ).filter(Boolean);

  const handleCreateProduct = async (data: any) => {
    try {
      const newProduct = await createProduct.mutateAsync({
        ...data,
        supplier_ids: [supplierId], // Associer automatiquement au fournisseur actuel
      });

      toast({
        title: '✅ Produit créé',
        description: `Le produit "${data.name}" a été créé et associé à ${supplierName}.`,
      });

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de créer le produit.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProduct = async (data: any) => {
    if (!editingProduct) return;

    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        updates: data,
      });

      toast({
        title: '✅ Produit modifié',
        description: `Le produit "${data.name}" a été mis à jour.`,
      });

      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de modifier le produit.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast({
        title: '✅ Produit supprimé',
        description: `Le produit "${productName}" a été supprimé.`,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de supprimer le produit.',
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produits Associés</CardTitle>
            <Skeleton className="h-10 w-24" />
          </div>
          <CardDescription>
            Produits fournis par {supplierName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produits Associés</CardTitle>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Produit
            </Button>
          </div>
          <CardDescription>
            Produits fournis par {supplierName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Aucun produit associé à ce fournisseur.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier produit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 cursor-pointer" onClick={() => navigate(`/dashboard/products/${product.id}`)}>
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Code: {product.product_code}
                        </p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-auto">
                        <Badge variant="secondary">{product.category}</Badge>
                        <p className="text-sm font-medium mt-1">
                          {product.default_price}€
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le produit "{product.name}" ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création */}
      <ProductModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleCreateProduct}
        isLoading={createProduct.isPending}
      />

      {/* Modal d'édition */}
      <ProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleUpdateProduct}
        isLoading={updateProduct.isPending}
      />
    </>
  );
};

export default SupplierProductsManager;