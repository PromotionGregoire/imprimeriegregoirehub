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
import EpuredOrderCard from '@/components/EpuredOrderCard';

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
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground">
              Impossible de charger les commandes. Veuillez réessayer.
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
          <h1 className="text-3xl font-bold">Commandes</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
        <h1 className="text-3xl font-bold">Commandes</h1>
        <Button onClick={() => window.alert('La création de commande se fait automatiquement à partir des soumissions acceptées.')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Commande
        </Button>
      </div>
      
      {/* Period Filter */}
      <div className="space-y-4">
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toute période</SelectItem>
            <SelectItem value="7days">7 derniers jours</SelectItem>
            <SelectItem value="30days">30 derniers jours</SelectItem>
            <SelectItem value="3months">3 derniers mois</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Commandes</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Valeur Totale</p>
                <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">En Attente Épreuve</p>
                <p className="text-2xl font-bold">{stats.pendingProof}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Complétées</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
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

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune commande trouvée</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Aucune commande ne correspond aux critères de recherche.'
                    : 'Les commandes créées à partir de soumissions acceptées apparaîtront ici.'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          orders.map((order) => (
            <EpuredOrderCard
              key={order.id}
              order={order}
              onProofAccepted={handleProofAccepted}
              onDelivered={handleDelivered}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;