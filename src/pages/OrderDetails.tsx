import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ModernToggle from '@/components/ModernToggle';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-details', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          clients (
            business_name,
            contact_name,
            email,
            phone_number
          ),
          submissions (
            submission_number,
            id
          )
        `)
        .eq('id', id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-details', id] });
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

  const handleProofAccepted = () => {
    updateOrderStatus.mutate({ orderId: id!, status: 'En production' });
  };

  const handleDelivered = () => {
    updateOrderStatus.mutate({ orderId: id!, status: 'Complétée' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente de l\'épreuve':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">En attente d'épreuve</Badge>;
      case 'En production':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">En production</Badge>;
      case 'Complétée':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Complétée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Commande introuvable</h3>
            <p className="text-muted-foreground mb-4">
              Cette commande n'existe pas ou a été supprimée.
            </p>
            <Button onClick={() => navigate('/dashboard/orders')}>
              Retour aux commandes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isProofAccepted = order.status === 'En production' || order.status === 'Complétée';
  const isDelivered = order.status === 'Complétée';

  return (
    <div className="p-6 space-y-6">
      {/* Header - Base Web Design System */}
      <div className="flex items-start justify-between gap-base-400 min-h-[60px]">
        <div className="flex items-start gap-base-400 sm:gap-base-500 min-w-0 flex-1">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/orders')}
            className="min-h-[44px] min-w-[44px] p-base-300 flex-shrink-0 flex items-center gap-base-200"
            aria-label="Retour aux commandes"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            <span className="hidden sm:inline text-base-300 font-medium">Retour</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base-750 font-semibold text-foreground leading-tight mb-base-200 truncate" title={order.order_number}>
              {order.order_number}
            </h1>
            <p className="text-base-300 text-muted-foreground font-medium">
              Créée le {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations de la commande */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Détails de la commande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Numéro de commande</label>
                  <p className="font-semibold">{order.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Montant total</label>
                  <p className="font-semibold text-2xl text-primary">
                    ${Number(order.total_price).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de création</label>
                  <p>{format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Soumission d'origine</label>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => navigate(`/dashboard/submissions/${order.submissions?.id}`)}
                  >
                    {order.submissions?.submission_number}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Entreprise</label>
                  <p className="font-semibold">{order.clients?.business_name}</p>
                </div>
                {order.clients?.contact_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact</label>
                    <p>{order.clients.contact_name}</p>
                  </div>
                )}
                {order.clients?.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{order.clients.email}</p>
                  </div>
                )}
                {order.clients?.phone_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                    <p>{order.clients.phone_number}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions de production */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suivi de Production</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ModernToggle
                id={`proof-${order.id}`}
                label="Épreuve acceptée"
                description="Faire avancer vers la production"
                checked={isProofAccepted}
                onCheckedChange={handleProofAccepted}
                disabled={isProofAccepted}
              />

              <ModernToggle
                id={`delivered-${order.id}`}
                label="Livré"
                description="Marquer comme terminé"
                checked={isDelivered}
                onCheckedChange={handleDelivered}
                disabled={!isProofAccepted || isDelivered}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;