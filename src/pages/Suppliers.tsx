import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlexibleDashboardToolbar } from '@/components/FlexibleDashboardToolbar';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierMutations } from '@/hooks/useSupplierMutations';
import SupplierCard from '@/components/SupplierCard';
import CreateSupplierModal from '@/components/CreateSupplierModal';

const Suppliers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const { data: suppliers, isLoading, error } = useSuppliers();
  const { deleteSupplier } = useSupplierMutations();

  // Filter suppliers based on search and type filter
  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = !searchQuery || 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'Fournisseur de biens' && supplier.is_goods_supplier) ||
      (typeFilter === 'Fournisseur de services' && supplier.is_service_supplier);
    
    return matchesSearch && matchesType;
  }) || [];

  // Calculate statistics
  const stats = {
    totalSuppliers: suppliers?.length || 0,
    goodsSuppliers: suppliers?.filter(s => s.is_goods_supplier).length || 0,
    serviceSuppliers: suppliers?.filter(s => s.is_service_supplier).length || 0,
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      deleteSupplier.mutate(id);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Building className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground">
              Impossible de charger les fournisseurs. Veuillez réessayer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Fournisseurs</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fournisseurs</h1>
        <Button onClick={() => setEditModalOpen(true)}>
          <Building className="h-4 w-4 mr-2" />
          Nouveau Fournisseur
        </Button>
      </div>
      
      {/* Modal de création/édition contrôlé */}
      <CreateSupplierModal
        supplier={editingSupplier}
        isOpen={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setEditingSupplier(null);
        }}
      />
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Fournisseurs</p>
                <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Fournisseurs de Biens</p>
                <p className="text-2xl font-bold">{stats.goodsSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Fournisseurs de Services</p>
                <p className="text-2xl font-bold">{stats.serviceSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <FlexibleDashboardToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par nom, contact ou email..."
        filters={[
          {
            label: "Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { value: "all", label: "Tous les types" },
              { value: "Fournisseur de biens", label: "Fournisseur de biens" },
              { value: "Fournisseur de services", label: "Fournisseur de services" }
            ]
          }
        ]}
      />

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun fournisseur trouvé</h3>
                <p className="text-muted-foreground">
                  {searchQuery || typeFilter !== 'all'
                    ? 'Aucun fournisseur ne correspond aux critères de recherche.'
                    : 'Commencez par créer votre premier fournisseur.'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Suppliers;