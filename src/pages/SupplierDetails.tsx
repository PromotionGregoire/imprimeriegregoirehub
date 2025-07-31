import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MoreHorizontal, Package, FileText, ShoppingCart, TrendingUp, Building, User, Mail, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierSpecialties } from '@/hooks/useSupplierSpecialties';
import { useProductSuppliers } from '@/hooks/useSupplierRelations';
import CreateSupplierModal from '@/components/CreateSupplierModal';
import SupplierProductsManager from '@/components/SupplierProductsManager';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SupplierDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: suppliers, isLoading } = useSuppliers();
  const { data: specialties } = useSupplierSpecialties(id);
  const { data: productSuppliers } = useProductSuppliers();

  const supplier = suppliers?.find(s => s.id === id);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Fournisseur non trouvé</h1>
        <Button onClick={() => navigate('/dashboard/suppliers')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux fournisseurs
        </Button>
      </div>
    );
  }

  const getTypeBadges = () => {
    const badges = [];
    if (supplier.is_goods_supplier) {
      badges.push(
        <Badge key="goods" className="bg-blue-100 text-blue-800">
          Fournisseur de biens
        </Badge>
      );
    }
    if (supplier.is_service_supplier) {
      badges.push(
        <Badge key="services" className="bg-green-100 text-green-800">
          Fournisseur de services
        </Badge>
      );
    }
    return badges.length > 0 ? badges : [
      <Badge key="none" variant="secondary">Non spécifié</Badge>
    ];
  };

  const goodsSpecialties = specialties?.filter(s => s.category_type === 'Bien') || [];
  const serviceSpecialties = specialties?.filter(s => s.category_type === 'Service') || [];

  // Calcul du nombre de produits associés
  const supplierProductsCount = productSuppliers?.filter(ps => ps.supplier_id === id).length || 0;

  // KPIs pour les fournisseurs
  const supplierKPIs = {
    totalProducts: supplierProductsCount,
    totalOrders: 0, // Nombre de commandes passées avec ce fournisseur
    lastOrderDate: null, // Dernière commande
    reliability: 100 // Taux de fiabilité
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/suppliers')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {getTypeBadges()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
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
            <CardTitle className="text-sm font-medium">Produits associés</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierKPIs.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes passées</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierKPIs.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spécialités</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goodsSpecialties.length + serviceSpecialties.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fiabilité</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierKPIs.reliability}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Informations Détaillées</TabsTrigger>
          <TabsTrigger value="products">Produits Associés</TabsTrigger>
          <TabsTrigger value="orders">Historique des Commandes</TabsTrigger>
          <TabsTrigger value="activity">Activités Récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations de contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations de Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Personne de contact</p>
                    <p className="font-medium">
                      {supplier.contact_person || <span className="text-muted-foreground italic">Non spécifié</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    {supplier.email ? (
                      <a
                        href={`mailto:${supplier.email}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {supplier.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Non spécifié</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    {supplier.phone ? (
                      <a
                        href={`tel:${supplier.phone}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {supplier.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Non spécifié</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Site web principal</p>
                      {supplier.website_1 ? (
                        <a
                          href={supplier.website_1.startsWith('http') ? supplier.website_1 : `https://${supplier.website_1}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {supplier.website_1}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">Non spécifié</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Site web secondaire</p>
                      {supplier.website_2 ? (
                        <a
                          href={supplier.website_2.startsWith('http') ? supplier.website_2 : `https://${supplier.website_2}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {supplier.website_2}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">Non spécifié</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spécialités */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Spécialités
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goodsSpecialties.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Catégories de produits</h4>
                    <div className="flex flex-wrap gap-2">
                      {goodsSpecialties.map((specialty) => (
                        <Badge key={specialty.id} variant="secondary">
                          {specialty.category_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {serviceSpecialties.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Catégories de services</h4>
                    <div className="flex flex-wrap gap-2">
                      {serviceSpecialties.map((specialty) => (
                        <Badge key={specialty.id} variant="outline">
                          {specialty.category_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {goodsSpecialties.length === 0 && serviceSpecialties.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Aucune spécialité définie pour ce fournisseur.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Produits associés */}
            {supplierProductsCount > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Produits Associés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Ce fournisseur est associé à {supplierProductsCount} produit{supplierProductsCount > 1 ? 's' : ''}.
                    Consultez l'onglet "Produits Associés" pour plus de détails.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {supplier.notes ? (
                  <p className="text-muted-foreground">{supplier.notes}</p>
                ) : (
                  <p className="text-muted-foreground italic">Aucune note ajoutée</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <SupplierProductsManager 
            supplierId={id!} 
            supplierName={supplier.name}
          />
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Commandes</CardTitle>
              <CardDescription>
                Commandes passées avec ce fournisseur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-4">
                Aucune commande enregistrée avec ce fournisseur.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activités Récentes</CardTitle>
              <CardDescription>
                Historique des interactions avec ce fournisseur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-gray-500 whitespace-nowrap">
                    {format(new Date(supplier.created_at), 'dd MMM yyyy - HH:mm', { locale: fr })}
                  </div>
                  <div className="text-gray-900">Fournisseur créé</div>
                </div>
                {supplier.updated_at !== supplier.created_at && (
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="text-gray-500 whitespace-nowrap">
                      {format(new Date(supplier.updated_at), 'dd MMM yyyy - HH:mm', { locale: fr })}
                    </div>
                    <div className="text-gray-900">Informations mises à jour</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <CreateSupplierModal
        supplier={supplier}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
};

export default SupplierDetails;