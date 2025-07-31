import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StatusManager from './StatusManager';
import { useProofToggle } from '@/hooks/useProofToggle';
import { useForceAcceptSubmission } from '@/hooks/useForceAcceptSubmission';

interface ModernSubmissionCardProps {
  submission: any;
  onClick: () => void;
}

const ModernSubmissionCard = ({ submission, onClick }: ModernSubmissionCardProps) => {
  // État pour l'acceptation manuelle (raccourci rapide)
  const [proofAccepted, setProofAccepted] = useState(submission.status === 'Acceptée');
  
  const proofToggle = useProofToggle(submission.id);
  const forceAcceptSubmission = useForceAcceptSubmission();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };


  const handleProofToggle = async (checked: boolean) => {
    if (checked) {
      // Déclencher la modale de confirmation pour acceptation manuelle
      const confirmed = window.confirm(
        "⚠️ ATTENTION: Acceptation Manuelle\n\n" +
        "Cette action va créer une commande officielle sans l'approbation numérique formelle du client.\n\n" +
        "Ceci doit être utilisé uniquement en cas de confirmation verbale ou écrite externe.\n\n" +
        "Voulez-vous continuer ?"
      );
      
      if (!confirmed) {
        return; // Annuler si pas confirmé
      }
    }
    
    setProofAccepted(checked);
    await proofToggle.mutateAsync({ isAccepted: checked });
  };

  // Dynamic card styling with PRIORITY logic - BACKGROUND color based on state
  const getCardStyles = () => {
    const baseClass = "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1";
    let backgroundClass = "bg-white";
    let borderClass = "border-l-4";
    
    // PRIORITÉ 1: Si épreuve acceptée manuellement = VERT (prend le dessus sur tout)
    if (proofAccepted) {
      backgroundClass = "bg-green-50";
      borderClass += " border-l-green-500 border-green-200";
      return `${baseClass} ${backgroundClass} ${borderClass}`;
    }
    
    // PRIORITÉ 2: Couleurs selon statut et timing
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
      onClick={onClick}
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
              onClick();
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

          {/* Bouton d'Acceptation Manuelle */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Forcing acceptance for submission:', submission.id);
                forceAcceptSubmission.mutate({ 
                  submissionId: submission.id,
                  approvedBy: 'Acceptation manuelle via interface'
                });
              }}
              disabled={submission.status === 'Acceptée' || forceAcceptSubmission.isPending}
              className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 text-xs"
            >
              {forceAcceptSubmission.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Acceptation...
                </>
              ) : submission.status === 'Acceptée' ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Acceptée
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accepter Soumission
                </>
              )}
            </Button>
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