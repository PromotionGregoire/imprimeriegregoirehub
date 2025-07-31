import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  const isProofAccepted = order.status === 'En production' || order.status === 'Complétée';
  const isDelivered = order.status === 'Complétée';

  // Format submission number to remove "Soumission #" prefix
  const formatSubmissionNumber = (submissionNumber: string) => {
    return submissionNumber?.replace(/^Soumission #/, '') || submissionNumber;
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

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'En attente de l\'épreuve':
        return 'border-l-orange-400';
      case 'En production':
        return 'border-l-blue-400';
      case 'Complétée':
        return 'border-l-emerald-400';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${getBorderColor(order.status)}`}>
      <CardHeader className="pb-3">
        {/* En-tête : Numéro + Badge + Montant */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">{order.order_number}</h3>
          {getStatusBadge(order.status)}
          <div className="text-right">
            <div className="font-bold text-xl text-primary">${Number(order.total_price).toFixed(2)}</div>
          </div>
        </div>
        
        {/* Ligne d'Information : Client + Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium">{order.clients?.business_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Zone d'Actions - Toggles Modernes */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Voir la soumission d'origine</span>
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

export default EpuredOrderCard;