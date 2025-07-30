import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StatusManager from './StatusManager';

interface ModernSubmissionCardProps {
  submission: any;
  onViewDetails: (id: string) => void;
}

const ModernSubmissionCard = ({ submission, onViewDetails }: ModernSubmissionCardProps) => {
  const [proofAccepted, setProofAccepted] = useState(false);
  const [delivered, setDelivered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  const getDeliveryStatusText = () => {
    if (delivered) return 'Livré';
    if (submission.status === 'Acceptée') return 'En cours';
    return 'En attente';
  };

  const getDeliveryStatusColor = () => {
    if (delivered) return 'text-green-600';
    if (submission.status === 'Acceptée') return 'text-blue-600';
    return 'text-gray-500';
  };

  // Dynamic card styling based on status and dates
  const getCardStyles = () => {
    const baseClass = "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white";
    let borderClass = "border-l-4";
    
    switch (submission.status) {
      case 'Acceptée':
        borderClass += " border-l-green-500";
        break;
      case 'Modification Demandée':
        borderClass += " border-l-blue-500";
        break;
      case 'Refusée':
        borderClass += " border-l-red-500";
        break;
      case 'Envoyée':
        // Check follow-up timing
        if (submission.sent_at) {
          const daysSinceLastMessage = Math.floor(
            (new Date().getTime() - new Date(submission.sent_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastMessage > 10) {
            borderClass += " border-l-red-400";
          } else if (daysSinceLastMessage > 5) {
            borderClass += " border-l-yellow-400";
          } else {
            borderClass += " border-l-blue-400";
          }
        } else {
          borderClass += " border-l-blue-400";
        }
        break;
      default:
        borderClass += " border-l-gray-300";
    }
    
    return `${baseClass} ${borderClass}`;
  };

  return (
    <Card 
      className={getCardStyles()}
      onClick={() => onViewDetails(submission.id)}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">📋</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Quote #{submission.submission_number}
              </h3>
              <p className="text-sm text-gray-500">
                {submission.clients?.business_name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(submission.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Date d'envoi:</span>
            <span className="text-sm font-medium">
              {submission.sent_at ? formatDate(submission.sent_at) : 'Non envoyée'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Échéance:</span>
            <span className="text-sm font-medium">
              {submission.deadline ? formatDate(submission.deadline) : 'Non définie'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Prix:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(Number(submission.total_price) || 0)}
            </span>
          </div>
        </div>

        {/* Status and Toggles */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          {/* Status Manager */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Statut:</span>
            <div onClick={(e) => e.stopPropagation()}>
              <StatusManager submission={submission} currentStatus={submission.status} />
            </div>
          </div>

          {/* Proof Accepted Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Épreuve acceptée:</span>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-sm font-medium">
                {proofAccepted ? 'Oui' : 'Non'}
              </span>
              <Switch
                checked={proofAccepted}
                onCheckedChange={setProofAccepted}
                disabled={submission.status !== 'Acceptée'}
              />
            </div>
          </div>

          {/* Delivered Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Livraison:</span>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className={`text-sm font-medium ${getDeliveryStatusColor()}`}>
                {getDeliveryStatusText()}
              </span>
              <Switch
                checked={delivered}
                onCheckedChange={setDelivered}
                disabled={submission.status !== 'Acceptée'}
              />
            </div>
          </div>
        </div>

        {/* View Proof Link */}
        {submission.approval_token && (
          <div className="pt-3 border-t border-gray-100">
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/approval/${submission.approval_token}`, '_blank');
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Voir le lien d'épreuve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModernSubmissionCard;