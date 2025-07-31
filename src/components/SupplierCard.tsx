import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, User, Mail, Phone, Edit, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface SupplierCardProps {
  supplier: {
    id: string;
    name: string;
    is_goods_supplier: boolean;
    is_service_supplier: boolean;
    contact_person?: string;
    email?: string;
    phone?: string;
    website_1?: string;
    website_2?: string;
    notes?: string;
  };
  onEdit: (supplier: any) => void;
  onDelete: (id: string) => void;
}

const SupplierCard = ({ supplier, onEdit, onDelete }: SupplierCardProps) => {
  const getTypeBadges = () => {
    const badges = [];
    if (supplier.is_goods_supplier) {
      badges.push(<Badge key="goods" className="bg-blue-100 text-blue-800">Fournisseur de biens</Badge>);
    }
    if (supplier.is_service_supplier) {
      badges.push(<Badge key="services" className="bg-green-100 text-green-800">Fournisseur de services</Badge>);
    }
    return badges.length > 0 ? badges : [<Badge key="none" variant="secondary">Non spécifié</Badge>];
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{supplier.name}</CardTitle>
              <div className="flex flex-wrap gap-1 mt-1">
                {getTypeBadges()}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border shadow-lg">
              <DropdownMenuItem onClick={() => onEdit(supplier)} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(supplier.id)}
                className="cursor-pointer text-destructive"
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {supplier.contact_person && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{supplier.contact_person}</span>
          </div>
        )}
        
        {supplier.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{supplier.email}</span>
          </div>
        )}
        
        {supplier.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{supplier.phone}</span>
          </div>
        )}

        {(supplier.website_1 || supplier.website_2) && (
          <div className="space-y-2">
            {supplier.website_1 && (
              <div className="text-sm">
                <span className="font-medium">Site web 1: </span>
                <a href={supplier.website_1} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {supplier.website_1}
                </a>
              </div>
            )}
            {supplier.website_2 && (
              <div className="text-sm">
                <span className="font-medium">Site web 2: </span>
                <a href={supplier.website_2} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {supplier.website_2}
                </a>
              </div>
            )}
          </div>
        )}

        {supplier.notes && (
          <div className="mt-3 p-3 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground">{supplier.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierCard;