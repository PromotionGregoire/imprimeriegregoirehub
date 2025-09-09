import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlexibleDashboardToolbar } from '@/components/FlexibleDashboardToolbar';
import { useFilteredOrders } from '@/hooks/useFilteredOrders';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ModernOrderCard from '@/components/ModernOrderCard';
import { cn } from '@/lib/utils';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { orders, isLoading, error } = useFilteredOrders(searchQuery, statusFilter, periodFilter);

  const orderStatusOptions = [
    { value: 'En attente de l\'épreuve', label: 'En attente de l\'épreuve' },
    { value: 'En production', label: 'En production' },
    { value: 'Complétée', label: 'Complétée' },
  ];

  // Update order status mutations
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-with-details'] });
      toast({
        title: '✅ Statut mis à jour',
        description: 'Le statut de la commande a été modifié avec succès.',
      });
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de mettre à jour le statut de la commande.',
        variant: 'destructive',
      });
    },
  });

  const handleProofAccepted = (orderId: string) => {
    updateOrderStatus.mutate({ orderId, status: 'En production' });
  };

  const handleDelivered = (orderId: string) => {
    updateOrderStatus.mutate({ orderId, status: 'Complétée' });
  };

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalValue: orders.reduce((sum, order) => sum + Number(order.total_price), 0),
    pendingProof: orders.filter(o => o.status === 'En attente de l\'épreuve').length,
    inProduction: orders.filter(o => o.status === 'En production').length,
    completed: orders.filter(o => o.status === 'Complétée').length,
  };

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto">
            <Package className="h-12 w-12 text-negative mx-auto mb-4" />
            <h3 className="text-lg font-medium leading-tight mb-2">Erreur de chargement</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              Impossible de charger les commandes. Veuillez réessayer.
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
          <h1 className="text-[36px] font-semibold leading-tight">Commandes</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
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
            <Package className="h-6 w-6 text-primary flex-shrink-0" />
            <h1 className={cn(
              "text-[36px] font-semibold leading-tight text-foreground",
              "truncate" // Prevent overflow
            )}>
              Commandes
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
            onClick={() => window.alert('La création de commande se fait automatiquement à partir des soumissions acceptées.')}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Nouvelle Commande</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        </div>
        
        {/* Period Filter - BaseWeb Form Controls */}
        <div className="mb-6">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className={cn(
              "w-full sm:w-[240px] min-h-[48px]",
              "bg-background border-border",
              "focus:ring-2 focus:ring-primary focus:border-primary"
            )}>
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border shadow-lg z-50">
              <SelectItem value="all" className="text-[16px] leading-relaxed">Toute période</SelectItem>
              <SelectItem value="7days" className="text-[16px] leading-relaxed">7 derniers jours</SelectItem>
              <SelectItem value="30days" className="text-[16px] leading-relaxed">30 derniers jours</SelectItem>
              <SelectItem value="3months" className="text-[16px] leading-relaxed">3 derniers mois</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics Cards - BaseWeb Card Pattern with 8px Grid */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          "gap-2 mb-6" // 8px gaps
        )}>
          {/* Total Orders Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Total Commandes
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Value Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-positive/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-positive flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Valeur Totale
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground truncate">
                    ${stats.totalValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Proof Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-warning flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    En Attente Épreuve
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.pendingProof}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-positive/10 rounded-lg">
                  <Package className="h-5 w-5 text-positive flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Complétées
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.completed}
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
            searchPlaceholder="Rechercher par numéro de commande, client ou soumission..."
            filters={[
              {
                label: "Statut",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "all", label: "Tous les statuts" },
                  ...orderStatusOptions
                ]
              }
            ]}
          />
        </div>

        {/* Orders Grid - Modern Cards Layout */}
        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
          "gap-6", // Espacement moderne
          "animate-fade-in"
        )}>
          {orders.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-background border-border">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center max-w-md mx-auto">
                    <Package className="h-12 w-12 text-muted-foreground/60 mb-4" />
                    <h3 className="text-[18px] font-medium leading-tight mb-2 text-foreground">
                      Aucune commande trouvée
                    </h3>
                    <p className="text-[16px] leading-relaxed text-muted-foreground text-center">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Aucune commande ne correspond aux critères de recherche.'
                        : 'Les commandes créées à partir de soumissions acceptées apparaîtront ici.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            orders.map((order) => (
              <ModernOrderCard
                key={order.id}
                order={order}
                onClick={() => window.location.href = `/dashboard/orders/${order.id}`}
                onProofAccepted={handleProofAccepted}
                onDelivered={handleDelivered}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;