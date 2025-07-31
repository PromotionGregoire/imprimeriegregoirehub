import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, X, Plus, Search } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProductSuppliers, useSupplierRelationMutations } from '@/hooks/useSupplierRelations';

interface ProductSuppliersManagerProps {
  productId?: string;
  productCategory?: string;
  onSuppliersChange?: (suppliers: any[]) => void;
}

const ProductSuppliersManager = ({ productId, productCategory, onSuppliersChange }: ProductSuppliersManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  
  const { data: allSuppliers } = useSuppliers();
  const { data: linkedSuppliers } = useProductSuppliers(productId);
  const { linkProductToSupplier, unlinkProductFromSupplier } = useSupplierRelationMutations();

  // Filtrer les fournisseurs selon la catégorie du produit et le terme de recherche
  const filteredSuppliers = allSuppliers?.filter(supplier => {
    const matchesSearch = !searchTerm || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Si c'est un fournisseur de biens, il peut être associé à des produits
    const isRelevant = supplier.is_goods_supplier;
    
    // Vérifier s'il n'est pas déjà lié
    const isNotLinked = !linkedSuppliers?.some(link => link.supplier_id === supplier.id);
    
    return matchesSearch && isRelevant && isNotLinked;
  }) || [];

  const handleAddSupplier = (supplierId: string) => {
    if (!productId) return;
    
    linkProductToSupplier.mutate(
      { productId, supplierId },
      {
        onSuccess: () => {
          setShowAddSupplier(false);
          setSearchTerm('');
        }
      }
    );
  };

  const handleRemoveSupplier = (supplierId: string) => {
    if (!productId) return;
    
    unlinkProductFromSupplier.mutate({ productId, supplierId });
  };

  useEffect(() => {
    if (onSuppliersChange && linkedSuppliers) {
      onSuppliersChange(linkedSuppliers);
    }
  }, [linkedSuppliers, onSuppliersChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Fournisseurs Associés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fournisseurs actuellement liés */}
        {linkedSuppliers && linkedSuppliers.length > 0 ? (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fournisseurs actuels</Label>
            <div className="flex flex-wrap gap-2">
              {linkedSuppliers.map((link) => (
                <Badge key={link.id} variant="secondary" className="flex items-center gap-1">
                  {link.suppliers?.name}
                  {productId && (
                    <button
                      onClick={() => handleRemoveSupplier(link.supplier_id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun fournisseur associé</p>
        )}

        {/* Ajouter des fournisseurs */}
        {productId && (
          <div className="space-y-3">
            {!showAddSupplier ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddSupplier(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un fournisseur
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un fournisseur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {filteredSuppliers.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredSuppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between p-2 rounded border hover:bg-muted cursor-pointer"
                        onClick={() => handleAddSupplier(supplier.id)}
                      >
                        <div>
                          <span className="font-medium">{supplier.name}</span>
                          {supplier.contact_person && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({supplier.contact_person})
                            </span>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <p className="text-sm text-muted-foreground">Aucun fournisseur trouvé</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Commencez à taper pour rechercher</p>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddSupplier(false);
                    setSearchTerm('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Message pour nouveaux produits */}
        {!productId && (
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
            💡 Sauvegardez d'abord le produit pour pouvoir associer des fournisseurs
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductSuppliersManager;