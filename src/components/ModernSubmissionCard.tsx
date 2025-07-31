import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
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
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-background border">
      <CardContent className="p-6" onClick={onClick}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {submission.submission_number}
              </h3>
              <p className="text-sm text-muted-foreground">
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
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Key Information */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Date d'envoi:</span>
            <span className="text-sm font-medium">
              {submission.sent_at ? formatDate(submission.sent_at) : 'Non envoyée'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Échéance:</span>
            <span className="text-sm font-medium">
              {submission.deadline ? formatDate(submission.deadline) : 'Non définie'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Montant:</span>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(Number(submission.total_price) || 0)}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-4">
          <SubmissionStatusTimeline status={submission.status} />
        </div>

        {/* Action Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm font-medium text-foreground">Accepter la Soumission</span>
          <Switch
            checked={submission.status === 'Acceptée'}
            onCheckedChange={handleAcceptSubmission}
            disabled={submission.status === 'Acceptée' || isAccepting}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Contextual Links */}
        <div className="mt-4 space-y-2">
          {submission.approval_token && (
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary/80"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/approval/${submission.approval_token}`, '_blank');
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Voir le lien d'épreuve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernSubmissionCard;