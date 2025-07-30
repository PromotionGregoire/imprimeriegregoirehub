import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, MoreHorizontal, DollarSign, FileText, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useClientDetails, useClientKPIs, useClientSubmissions, useClientOrders, useClientActivityLogs } from '@/hooks/useClientDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: client, isLoading: clientLoading } = useClientDetails(id!);
  const { data: kpis, isLoading: kpisLoading } = useClientKPIs(id!);
  const { data: submissions, isLoading: submissionsLoading } = useClientSubmissions(id!);
  const { data: orders, isLoading: ordersLoading } = useClientOrders(id!);
  const { data: activityLogs, isLoading: activityLoading } = useClientActivityLogs(id!);

  if (clientLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Client non trouvé</h1>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au dashboard
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Actif': 'default',
      'Prospect': 'secondary',
      'Inactif': 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getSubmissionStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Brouillon': 'outline',
      'Envoyée': 'secondary',
      'Acceptée': 'default',
      'Refusée': 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'En attente de l\'épreuve': 'secondary',
      'En production': 'default',
      'Terminée': 'default',
      'Annulée': 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.business_name}</h1>
            <p className="text-gray-600">{client.client_number}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Soumission
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpisLoading ? <Skeleton className="h-8 w-20" /> : `${kpis?.totalRevenue.toLocaleString('fr-CA')} $`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumissions totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpisLoading ? <Skeleton className="h-8 w-12" /> : kpis?.totalSubmissions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpisLoading ? <Skeleton className="h-8 w-12" /> : kpis?.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpisLoading ? <Skeleton className="h-8 w-16" /> : `${kpis?.conversionRate.toFixed(1)}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Informations Détaillées</TabsTrigger>
          <TabsTrigger value="submissions">Historique des Soumissions</TabsTrigger>
          <TabsTrigger value="orders">Historique des Commandes</TabsTrigger>
          <TabsTrigger value="activity">Activités Récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Type de client:</span> 
                  <Badge variant="outline" className="ml-2">{client.client_type}</Badge>
                </div>
                <div>
                  <span className="font-medium">Industrie:</span> {client.industry || 'Non spécifiée'}
                </div>
                <div>
                  <span className="font-medium">Statut:</span> 
                  <span className="ml-2">{getStatusBadge(client.status || 'Prospect')}</span>
                </div>
                <div>
                  <span className="font-medium">Source:</span> {client.lead_source || 'Non spécifiée'}
                </div>
              </CardContent>
            </Card>

            {/* Contact principal */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Nom:</span> {client.contact_name}
                </div>
                <div>
                  <span className="font-medium">Poste:</span> {client.main_contact_position || 'Non spécifié'}
                </div>
                <div>
                  <span className="font-medium">Courriel:</span>{' '}
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                    {client.email}
                  </a>
                </div>
                <div>
                  <span className="font-medium">Téléphone:</span>{' '}
                  <a href={`tel:${client.phone_number}`} className="text-blue-600 hover:underline">
                    {client.phone_number}
                  </a>
                </div>
                {client.secondary_contact_info && (
                  <div>
                    <span className="font-medium">Contact secondaire:</span>
                    <p className="text-sm text-gray-600 mt-1">{client.secondary_contact_info}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Adresse de facturation */}
            {(client.billing_street || client.billing_city) && (
              <Card>
                <CardHeader>
                  <CardTitle>Adresse de Facturation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {client.billing_street && <div>{client.billing_street}</div>}
                    <div>
                      {client.billing_city} {client.billing_province} {client.billing_postal_code}
                    </div>
                    {client.billing_street && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(
                          `${client.billing_street}, ${client.billing_city} ${client.billing_province} ${client.billing_postal_code}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs mt-2 inline-block"
                      >
                        Voir sur Google Maps
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Adresse d'expédition */}
            {(client.shipping_street || client.shipping_city) && (
              <Card>
                <CardHeader>
                  <CardTitle>Adresse d'Expédition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {client.shipping_street && <div>{client.shipping_street}</div>}
                    <div>
                      {client.shipping_city} {client.shipping_province} {client.shipping_postal_code}
                    </div>
                    {client.shipping_street && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(
                          `${client.shipping_street}, ${client.shipping_city} ${client.shipping_province} ${client.shipping_postal_code}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs mt-2 inline-block"
                      >
                        Voir sur Google Maps
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informations administratives */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informations Administratives</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Numéros de taxes:</span> {client.tax_numbers || 'Non spécifiés'}
                </div>
                <div>
                  <span className="font-medium">Termes de paiement:</span> {client.default_payment_terms || 'Non spécifiés'}
                </div>
                {client.general_notes && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Notes générales:</span>
                    <p className="text-sm text-gray-600 mt-1">{client.general_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Soumissions</CardTitle>
              <CardDescription>
                {submissionsLoading ? 'Chargement...' : `${submissions?.length || 0} soumission(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : submissions && submissions.length > 0 ? (
                <div className="space-y-2">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <div className="font-medium">{submission.submission_number}</div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(submission.created_at), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {submission.total_price ? `${Number(submission.total_price).toLocaleString('fr-CA')} $` : 'À calculer'}
                        </div>
                        <div>{getSubmissionStatusBadge(submission.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune soumission trouvée pour ce client.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Commandes</CardTitle>
              <CardDescription>
                {ordersLoading ? 'Chargement...' : `${orders?.length || 0} commande(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <div className="font-medium">{order.order_number}</div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {Number(order.total_price).toLocaleString('fr-CA')} $
                        </div>
                        <div>{getOrderStatusBadge(order.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune commande trouvée pour ce client.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activités Récentes</CardTitle>
              <CardDescription>
                {activityLoading ? 'Chargement...' : `${activityLogs?.length || 0} activité(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : activityLogs && activityLogs.length > 0 ? (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 text-sm">
                      <div className="text-gray-500 whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd MMM yyyy - HH:mm', { locale: fr })}
                      </div>
                      <div className="text-gray-900">{log.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune activité enregistrée pour ce client.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;