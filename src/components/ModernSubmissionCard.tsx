import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  ExternalLink, 
  Loader2, 
  CheckCircle, 
  FileText 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SubmissionStatusTimeline } from './SubmissionStatusTimeline';
import ModernToggle from './ModernToggle';
import { useForceAcceptSubmission } from '@/hooks/useForceAcceptSubmission';

interface ModernSubmissionCardProps {
  submission: any;
  onClick: () => void;
}

const ModernSubmissionCard = ({ submission, onClick }: ModernSubmissionCardProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
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

  const handleAcceptSubmission = async (checked: boolean) => {
    if (!checked) return;
    
    const confirmed = window.confirm(
      "⚠️ ATTENTION: Acceptation Manuelle\n\n" +
      "Cette action va créer une commande officielle sans l'approbation numérique formelle du client.\n\n" +
      "Ceci doit être utilisé uniquement en cas de confirmation verbale ou écrite externe.\n\n" +
      "Voulez-vous continuer ?"
    );
    
    if (!confirmed) return;
    
    setIsAccepting(true);
    try {
      await forceAcceptSubmission.mutateAsync({ 
        submissionId: submission.id,
        approvedBy: 'Acceptation manuelle via interface'
      });
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 ease-uber hover:shadow-xl hover:-translate-y-1 bg-background border border-border/60 hover:border-border rounded-xl touch-area">
      <CardContent className="p-6" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-foreground leading-tight truncate">
                {submission.clients?.business_name}
              </h3>
              <p className="text-sm text-muted-foreground font-mono mt-base-200">
                {submission.submission_number}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 ease-uber touch-area flex-shrink-0 h-8 w-8"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Key Information */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">Date d'envoi:</span>
            <span className="text-sm font-medium text-foreground">
              {submission.sent_at ? formatDate(submission.sent_at) : 'Non envoyée'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">Échéance:</span>
            <span className="text-sm font-medium text-foreground">
              {submission.deadline ? formatDate(submission.deadline) : 'Non définie'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">Montant:</span>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(Number(submission.total_price) || 0)}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-6">
          <SubmissionStatusTimeline status={submission.status} />
        </div>

        {/* Action Toggle */}
        <div className="pt-4 border-t border-border/50">
          <ModernToggle
            id={`accept-${submission.id}`}
            label="Accepter la Soumission"
            checked={submission.status === 'Acceptée'}
            onCheckedChange={handleAcceptSubmission}
            disabled={submission.status === 'Acceptée' || isAccepting}
          />
        </div>

        {/* Contextual Links */}
        <div className="mt-4 space-y-2">
          {submission.approval_token && (
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary/80 touch-area text-sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/approval/${submission.approval_token}`, '_blank');
              }}
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              Voir le lien d'épreuve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernSubmissionCard;