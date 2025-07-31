import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, FileText, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import OrderStatusTimeline from './OrderStatusTimeline';
import ModernToggle from './ModernToggle';

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
  const isProofAccepted = order.status === 'En production' || order.status === 'Complétée';
  const isDelivered = order.status === 'Complétée';

  // Format submission number to remove "Soumission #" prefix
  const formatSubmissionNumber = (submissionNumber: string) => {
    return submissionNumber?.replace(/^Soumission #/, '') || submissionNumber;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-4">
        {/* Header with order number and client */}
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-1">
            <h3 className="font-bold text-xl tracking-tight">{order.order_number}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">{order.clients?.business_name}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-xl text-primary">${Number(order.total_price).toFixed(2)}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Timeline */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Progression de la commande
          </h4>
          <OrderStatusTimeline currentStatus={order.status} />
        </div>

        {/* Action Toggles */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Actions
          </h4>
          
          <ModernToggle
            id={`proof-${order.id}`}
            label="Épreuve acceptée"
            description="Faire avancer vers la production"
            checked={isProofAccepted}
            onCheckedChange={() => !isProofAccepted && onProofAccepted(order.id)}
            disabled={isProofAccepted}
          />

          <ModernToggle
            id={`delivered-${order.id}`}
            label="Livré"
            description="Marquer comme terminé"
            checked={isDelivered}
            onCheckedChange={() => !isDelivered && onDelivered(order.id)}
            disabled={!isProofAccepted || isDelivered}
          />
        </div>

        {/* Original Submission Link */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Soumission d'origine :</span>
            <Button variant="link" size="sm" className="p-0 h-auto text-primary font-semibold">
              {formatSubmissionNumber(order.submissions?.submission_number || '')}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;