import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import ModernToggle from './ModernToggle';
import OrderStatusVisualTimeline from './OrderStatusVisualTimeline';

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

const EpuredOrderCard = ({ order, onProofAccepted, onDelivered }: OrderCardProps) => {
  const navigate = useNavigate();
  const isProofAccepted = order.status === 'En production' || order.status === 'Complétée';
  const isDelivered = order.status === 'Complétée';

  const handleCardClick = (e: React.MouseEvent) => {
    // Éviter la navigation si on clique sur un toggle ou bouton
    if ((e.target as HTMLElement).closest('button, [role="switch"]')) {
      return;
    }
    navigate(`/dashboard/orders/${order.id}`);
  };

  // Format submission number to remove "Soumission #" prefix
  const formatSubmissionNumber = (submissionNumber: string) => {
    return submissionNumber?.replace(/^Soumission #/, '') || submissionNumber;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente de l\'épreuve':
        return <Badge className="bg-[hsl(var(--status-orange-light))] text-[hsl(var(--status-orange))] border-[hsl(var(--status-orange))]">En attente d'épreuve</Badge>;
      case 'En production':
        return <Badge className="bg-[hsl(var(--status-green-light))] text-[hsl(var(--status-green))] border-[hsl(var(--status-green))]">En production</Badge>;
      case 'Complétée':
        return <Badge className="bg-[hsl(var(--status-purple-light))] text-[hsl(var(--status-purple))] border-[hsl(var(--status-purple))]">Complétée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'En attente de l\'épreuve':
        return 'border-l-[hsl(var(--status-orange))]';
      case 'En production':
        return 'border-l-[hsl(var(--status-green))]';
      case 'Complétée':
        return 'border-l-[hsl(var(--status-purple))]';
      default:
        return 'border-l-muted-foreground';
    }
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-all ease-uber border-l-4 cursor-pointer touch-area ${getBorderColor(order.status)}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-base-300">
        {/* En-tête réorganisé : Numéro | Badge | Montant */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base-500 text-foreground">{order.order_number}</h3>
          {getStatusBadge(order.status)}
          <div className="text-right">
            <div className="font-bold text-base-650 text-primary">${Number(order.total_price).toFixed(2)}</div>
          </div>
        </div>
        
        {/* Ligne d'Information : Client + Date */}
        <div className="flex items-center justify-between text-base-300 text-muted-foreground">
          <div className="flex items-center gap-base-200">
            <User className="h-base-400 w-base-400" />
            <span className="font-medium">{order.clients?.business_name}</span>
          </div>
          <div className="flex items-center gap-base-100">
            <Calendar className="h-base-300 w-base-300" />
            {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-base-400">
        {/* Visual Timeline for Order Status */}
        <div>
          <OrderStatusVisualTimeline 
            currentStatus={order.status} 
            size="sm"
            showLabels={true}
          />
        </div>

        {/* Zone d'Actions - Toggles Modernes */}
        <div className="space-y-base-300 pt-base-300 border-t border-border">
          <div className="text-base-200 font-semibold text-muted-foreground uppercase tracking-wide">
            Actions de Production
          </div>
          
          <ModernToggle
            id={`proof-${order.id}`}
            label="Épreuve acceptée"
            checked={isProofAccepted}
            onCheckedChange={() => !isProofAccepted && onProofAccepted(order.id)}
            disabled={isProofAccepted}
          />

          <ModernToggle
            id={`delivered-${order.id}`}
            label="Livré"
            checked={isDelivered}
            onCheckedChange={() => !isDelivered && onDelivered(order.id)}
            disabled={!isProofAccepted || isDelivered}
          />
        </div>

        {/* Lien d'Origine */}
        <div className="pt-base-300 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-base-200 text-base-300 text-muted-foreground">
              <FileText className="h-base-400 w-base-400" />
              <span>Soumission d'origine</span>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-primary font-semibold hover:underline touch-area"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/submissions/${order.submission_id}`);
              }}
            >
              {formatSubmissionNumber(order.submissions?.submission_number || '')}
              <ExternalLink className="h-base-300 w-base-300 ml-base-100" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpuredOrderCard;