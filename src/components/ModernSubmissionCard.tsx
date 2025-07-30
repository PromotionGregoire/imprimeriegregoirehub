import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StatusManager from './StatusManager';
import { useProofToggle, useDeliveryToggle } from '@/hooks/useProofToggle';

interface ModernSubmissionCardProps {
  submission: any;
  onViewDetails: (id: string) => void;
}

const ModernSubmissionCard = ({ submission, onViewDetails }: ModernSubmissionCardProps) => {
  // Initialize based on submission status or stored state  
  const [proofAccepted, setProofAccepted] = useState(submission.status === 'Acceptée');
  const [delivered, setDelivered] = useState(submission.status === 'Livrée');
  
  const proofToggle = useProofToggle(submission.id);
  const deliveryToggle = useDeliveryToggle(submission.id);

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

  const handleProofToggle = async (checked: boolean) => {
    setProofAccepted(checked);
    await proofToggle.mutateAsync({ isAccepted: checked });
  };

  const handleDeliveryToggle = async (checked: boolean) => {
    setDelivered(checked);
    await deliveryToggle.mutateAsync({ isDelivered: checked });
  };

  // Dynamic card styling with PRIORITY logic - BACKGROUND color based on state
  const getCardStyles = () => {
    const baseClass = "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1";
    let backgroundClass = "bg-white";
    let borderClass = "border-l-4";
    
    // PRIORITÉ 1: Si épreuve acceptée = VERT (prend le dessus sur tout)
    if (proofAccepted) {
      backgroundClass = "bg-green-50";
      borderClass += " border-l-green-500 border-green-200";
      return `${baseClass} ${backgroundClass} ${borderClass}`;
    }
    
    // PRIORITÉ 2: Si livré = VIOLET 
    if (delivered) {
      backgroundClass = "bg-purple-50";
      borderClass += " border-l-purple-500 border-purple-200";
      return `${baseClass} ${backgroundClass} ${borderClass}`;
    }
    
    // PRIORITÉ 3: Couleurs selon statut et timing
    switch (submission.status) {
      case 'Acceptée':
        backgroundClass = "bg-green-50";
        borderClass += " border-l-green-500 border-green-200";
        break;
      case 'Modification Demandée':
        backgroundClass = "bg-blue-50";
        borderClass += " border-l-blue-500 border-blue-200";
        break;
      case 'Refusée':
        backgroundClass = "bg-red-50";
        borderClass += " border-l-red-500 border-red-200";
        break;
      case 'Envoyée':
        // Vérifier le timing seulement si pas accepté
        if (submission.sent_at) {
          const daysSinceLastMessage = Math.floor(
            (new Date().getTime() - new Date(submission.sent_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastMessage > 10) {
            backgroundClass = "bg-red-50";
            borderClass += " border-l-red-400 border-red-200";
          } else if (daysSinceLastMessage > 5) {
            backgroundClass = "bg-orange-50";
            borderClass += " border-l-orange-400 border-orange-200";
          } else {
            backgroundClass = "bg-blue-50";
            borderClass += " border-l-blue-400 border-blue-200";
          }
        } else {
          backgroundClass = "bg-blue-50";
          borderClass += " border-l-blue-400 border-blue-200";
        }
        break;
      default:
        backgroundClass = "bg-gray-50";
        borderClass += " border-l-gray-300 border-gray-200";
    }
    
    return `${baseClass} ${backgroundClass} ${borderClass}`;
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
              Soumission #{submission.submission_number}
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
              <span className={`text-sm font-medium ${proofAccepted ? 'text-green-600' : 'text-gray-500'}`}>
                {proofAccepted ? 'Oui' : 'Non'}
              </span>
              <Switch
                checked={proofAccepted}
                onCheckedChange={handleProofToggle}
                disabled={submission.status !== 'Acceptée' || proofToggle.isPending}
                className="data-[state=checked]:bg-green-600"
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
                onCheckedChange={handleDeliveryToggle}
                disabled={submission.status !== 'Acceptée' || deliveryToggle.isPending}
                className="data-[state=checked]:bg-green-600"
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