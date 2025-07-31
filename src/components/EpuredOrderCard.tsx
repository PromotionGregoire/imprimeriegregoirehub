import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
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
      <CardContent className="p-4 sm:p-5 lg:p-6">
        {/* Header : Nom d'entreprise principal + Montant à droite */}
        <div className="flex items-start justify-between mb-base-300">
          <div className="flex-1">
            <h3 className="font-bold text-base-500 text-foreground leading-tight">
              {order.clients?.business_name}
            </h3>
            <p className="text-base-300 text-muted-foreground font-mono mt-base-100">
              {order.order_number}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-base-650 text-primary">
              ${Number(order.total_price).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Badge de Statut Unique */}
        <div className="mb-base-500">
          {getStatusBadge(order.status)}
        </div>

        {/* Section des Actions - Toggles Modernes */}
        <div className="pt-base-400 border-t border-border">
          <div className="space-y-base-300">
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
        </div>

        {/* Footer - Lien vers Soumission d'Origine */}
        <div className="pt-base-400 mt-base-400 border-t border-border">
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors ease-uber text-base-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/submissions/${order.submission_id}`);
            }}
          >
            Voir soumission {formatSubmissionNumber(order.submissions?.submission_number || '')}
            <ExternalLink className="h-base-300 w-base-300 ml-base-200" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpuredOrderCard;