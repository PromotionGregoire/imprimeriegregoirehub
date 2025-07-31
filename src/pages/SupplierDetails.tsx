import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, User, Mail, Phone, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierSpecialties } from '@/hooks/useSupplierSpecialties';
import { Skeleton } from '@/components/ui/skeleton';

const SupplierDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: suppliers, isLoading } = useSuppliers();
  const { data: specialties } = useSupplierSpecialties(id);

  const supplier = suppliers?.find(s => s.id === id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Fournisseur introuvable</h3>
            <p className="text-muted-foreground mb-4">
              Ce fournisseur n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => navigate('/dashboard/suppliers')}>
              Retour aux fournisseurs
            </Button>
          </div>
        </div>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/suppliers')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{supplier.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {getTypeBadges()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations de contact
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
                      href={supplier.website_1}
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
                      href={supplier.website_2}
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

        {/* Notes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
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
    </div>
  );
};

export default SupplierDetails;