import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, ExternalLink, Loader2, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SubmissionStatusTimeline } from './SubmissionStatusTimeline';
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
    <Card className="group cursor-pointer transition-all ease-uber hover:shadow-lg hover:-translate-y-1 bg-background border touch-area">
      <CardContent className="p-base-600" onClick={onClick}>
        {/* Header */}
        <div className="flex items-center justify-between mb-base-400">
          <div className="flex items-center gap-base-300">
            <div className="w-base-600 h-base-600 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-base-400 w-base-400 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base-400 text-foreground">
                {submission.submission_number}
              </h3>
              <p className="text-base-300 text-muted-foreground">
                {submission.clients?.business_name}
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
            className="opacity-0 group-hover:opacity-100 transition-all ease-uber touch-area"
          >
            <ArrowRight className="h-base-400 w-base-400" />
          </Button>
        </div>

        {/* Key Information */}
        <div className="space-y-base-300 mb-base-400">
          <div className="flex justify-between items-center">
            <span className="text-base-300 text-muted-foreground">Date d'envoi:</span>
            <span className="text-base-300 font-medium">
              {submission.sent_at ? formatDate(submission.sent_at) : 'Non envoyée'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-base-300 text-muted-foreground">Échéance:</span>
            <span className="text-base-300 font-medium">
              {submission.deadline ? formatDate(submission.deadline) : 'Non définie'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-base-300 text-muted-foreground">Montant:</span>
            <span className="text-base-500 font-bold text-foreground">
              {formatPrice(Number(submission.total_price) || 0)}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-base-400">
          <SubmissionStatusTimeline status={submission.status} />
        </div>

        {/* Action Toggle */}
        <div className="flex items-center justify-between pt-base-300 border-t border-border">
          <span className="text-base-300 font-medium text-foreground">Accepter la Soumission</span>
          <Switch
            checked={submission.status === 'Acceptée'}
            onCheckedChange={handleAcceptSubmission}
            disabled={submission.status === 'Acceptée' || isAccepting}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Contextual Links */}
        <div className="mt-base-400 space-y-base-200">
          {submission.approval_token && (
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary/80 touch-area"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/approval/${submission.approval_token}`, '_blank');
              }}
            >
              <ExternalLink className="w-base-300 h-base-300 mr-base-100" />
              Voir le lien d'épreuve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernSubmissionCard;