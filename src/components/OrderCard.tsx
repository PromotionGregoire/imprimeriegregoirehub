import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, FileText, User, ExternalLink, CheckCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrderCardProps {
  order: {
    id: string;
    order_number: string;
    status: string;
    total_price: number;
    created_at: string;
    client_id: string;
    submission_id: string;
    clients?: {
      business_name: string;
    };
    submissions?: {
      submission_number: string;
    };
  };
  onProofAccepted: (orderId: string) => void;
  onDelivered: (orderId: string) => void;
}

const OrderCard = ({ order, onProofAccepted, onDelivered }: OrderCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente de l\'épreuve':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'En production':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Complétée':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'En attente de l\'épreuve':
        return 'secondary';
      case 'En production':
        return 'default';
      case 'Complétée':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const isProofAccepted = order.status === 'En production' || order.status === 'Complétée';
  const isDelivered = order.status === 'Complétée';

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${getStatusColor(order.status)}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{order.order_number}</h3>
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{order.clients?.business_name}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg">${Number(order.total_price).toFixed(2)}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Lien vers la soumission d'origine */}
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Soumission d'origine:</span>
            <Button variant="link" size="sm" className="p-0 h-auto text-primary">
              {order.submissions?.submission_number}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>

          {/* Contrôles de production */}
          <div className="border-t pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={`proof-${order.id}`} className="text-sm font-medium">
                  Épreuve acceptée
                </Label>
              </div>
              <Switch
                id={`proof-${order.id}`}
                checked={isProofAccepted}
                onCheckedChange={() => !isProofAccepted && onProofAccepted(order.id)}
                disabled={isProofAccepted}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={`delivered-${order.id}`} className="text-sm font-medium">
                  Livré
                </Label>
              </div>
              <Switch
                id={`delivered-${order.id}`}
                checked={isDelivered}
                onCheckedChange={() => !isDelivered && onDelivered(order.id)}
                disabled={!isProofAccepted || isDelivered}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;