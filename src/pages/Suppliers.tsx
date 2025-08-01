import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Package, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlexibleDashboardToolbar } from '@/components/FlexibleDashboardToolbar';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierMutations } from '@/hooks/useSupplierMutations';
import SupplierCard from '@/components/SupplierCard';
import CreateSupplierModal from '@/components/CreateSupplierModal';
import { cn } from '@/lib/utils';

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
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto">
            <Building className="h-12 w-12 text-negative mx-auto mb-4" />
            <h3 className="text-lg font-medium leading-tight mb-2">Erreur de chargement</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              Impossible de charger les fournisseurs. Veuillez réessayer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[36px] font-semibold leading-tight">Fournisseurs</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-lg" />
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
            <Building className="h-6 w-6 text-primary flex-shrink-0" />
            <h1 className={cn(
              "text-[36px] font-semibold leading-tight text-foreground",
              "truncate" // Prevent overflow
            )}>
              Fournisseurs
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
            <span className="hidden sm:inline">Nouveau Fournisseur</span>
            <span className="sm:hidden">Nouveau</span>
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
        
        {/* Statistics Cards - BaseWeb Card Pattern with 8px Grid */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          "gap-2 mb-6" // 8px gaps
        )}>
          {/* Total Suppliers Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Total Fournisseurs
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.totalSuppliers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goods Suppliers Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <Package className="h-5 w-5 text-info flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Fournisseurs de Biens
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.goodsSuppliers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Suppliers Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-positive/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-positive flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Fournisseurs de Services
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.serviceSuppliers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar - BaseWeb Search and Filter Pattern */}
        <div className="mb-6">
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
        </div>

        {/* Suppliers Grid - BaseWeb Layout Grid */}
        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
          "gap-2" // 8px grid spacing
        )}>
          {filteredSuppliers.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-background border-border">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center max-w-md mx-auto">
                    <Building className="h-12 w-12 text-muted-foreground/60 mb-4" />
                    <h3 className="text-[18px] font-medium leading-tight mb-2 text-foreground">
                      Aucun fournisseur trouvé
                    </h3>
                    <p className="text-[16px] leading-relaxed text-muted-foreground text-center">
                      {searchQuery || typeFilter !== 'all'
                        ? 'Aucun fournisseur ne correspond aux critères de recherche.'
                        : 'Commencez par créer votre premier fournisseur.'}
                    </p>
                  </div>
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
    </div>
  );
};

export default Suppliers;