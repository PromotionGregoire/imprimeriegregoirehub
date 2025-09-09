import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRight, 
  ExternalLink, 
  Loader2, 
  CheckCircle, 
  FileText,
  Eye,
  Send,
  MoreVertical,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SubmissionStatusTimeline } from './SubmissionStatusTimeline';
import ModernToggle from './ModernToggle';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArchiveBadge } from './ArchiveBadge';
import { cn } from '@/lib/utils';

interface ModernSubmissionCardProps {
  submission: any;
  onClick: () => void;
  isSelected?: boolean;
  onSelect?: (e?: React.MouseEvent) => void;
}

const ModernSubmissionCard = ({ submission, onClick, isSelected = false, onSelect }: ModernSubmissionCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const acceptSubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { data, error } = await supabase.functions.invoke('handle-submission-approval', {
        body: { 
          submission_id: submissionId,
          client_name: submission.clients?.business_name || 'Client'
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: '✅ Soumission approuvée',
        description: `Commande ${data.order_number} créée automatiquement`
      });
      
      // Invalider les queries pour refetch les données
      queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submission-details', submission.id] });
    },
    onError: (error) => {
      console.error('Erreur lors de l\'approbation:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'approuver la soumission',
        variant: 'destructive'
      });
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  // Calculate priority based on deadline and status
  const getPriority = () => {
    const deadline = submission.deadline ? new Date(submission.deadline) : null;
    const today = new Date();
    const daysLeft = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    if (submission.status === 'Refusée') return 'critical';
    if (daysLeft !== null && daysLeft <= 1) return 'critical';
    if (daysLeft !== null && daysLeft <= 3) return 'high';
    if (daysLeft !== null && daysLeft <= 7) return 'normal';
    return 'low';
  };

  // Get status color for dot indicator
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Acceptée': return 'bg-green-500';
      case 'Refusée': return 'bg-red-500';
      case 'Envoyée': return 'bg-blue-500';
      case 'Brouillon': return 'bg-gray-400';
      default: return 'bg-orange-500';
    }
  };

  // Get priority bar color and animation
  const getPriorityBar = (priority: string) => {
    switch(priority) {
      case 'critical': 
        return 'bg-red-500 animate-pulse';
      case 'high': 
        return 'bg-orange-500';
      case 'normal': 
        return 'bg-yellow-400';
      case 'low': 
        return 'bg-gray-300';
      default: 
        return 'bg-transparent';
    }
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    const deadline = submission.deadline ? new Date(submission.deadline) : null;
    if (!deadline) return null;
    
    const today = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
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
    
    acceptSubmissionMutation.mutate(submission.id);
  };

  const priority = getPriority();
  const daysRemaining = getDaysRemaining();
  const statusColor = getStatusColor(submission.status);
  const priorityBarClass = getPriorityBar(priority);

  return (
    <Card className={cn(
      "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white border rounded-2xl overflow-hidden",
      isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-gray-100"
    )}>
      {/* Priority Indicator Bar */}
      <div className={`h-1 transition-all duration-300 group-hover:h-1.5 ${priorityBarClass}`}></div>
      
      <CardContent className="p-5">
        {/* Selection Checkbox */}
        {onSelect && (
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect?.()}
              className="bg-white border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Card content wrapper with click handler */}
        <div onClick={onClick} className="w-full">
          {/* Header with Status Dot */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-base truncate">
                  {submission.clients?.business_name || 'Client Non Défini'}
                </h3>
                <div className={`w-2 h-2 rounded-full ${statusColor} ${priority === 'critical' ? 'animate-pulse' : ''}`}></div>
              </div>
              <p className="text-xs text-gray-500 font-mono">{submission.submission_number}</p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Amount - Prominent Display */}
          <div className="mb-4">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(Number(submission.total_price) || 0)}
            </p>
            {/* Show trend if high value */}
            {Number(submission.total_price) > 1000 && (
              <div className="flex items-center text-green-600 text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Valeur élevée</span>
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Échéance</span>
              <span className={`font-medium ${
                submission.deadline === 'Non définie' || !submission.deadline ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {submission.deadline ? formatDate(submission.deadline) : 'Non définie'}
                {daysRemaining !== null && (
                  <span className={`ml-2 text-xs ${
                    daysRemaining <= 1 ? 'text-red-600 font-bold' :
                    daysRemaining <= 3 ? 'text-orange-600 font-medium' :
                    daysRemaining <= 7 ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    {daysRemaining <= 0 ? '(Échue)' : `(J-${daysRemaining})`}
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Statut</span>
              <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                submission.status === 'Acceptée' 
                  ? 'bg-green-100 text-green-700' :
                submission.status === 'Refusée'
                  ? 'bg-red-100 text-red-700' :
                submission.status === 'Envoyée'
                  ? 'bg-blue-100 text-blue-700' :
                submission.status === 'Brouillon'
                  ? 'bg-gray-100 text-gray-700' :
                  'bg-orange-100 text-orange-700'
              }`}>
                {submission.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {(submission.status === 'Acceptée' || submission.approval_token) && (
              <button className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-white ${
                priority === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900'
              }`}>
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Voir l'épreuve</span>
              </button>
            )}
            
            {submission.status === 'Brouillon' && (
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Send className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Envoyer</span>
              </button>
            )}
            
            {!submission.status || submission.status === 'En attente' ? (
              <div className="flex-1">
                <ModernToggle
                  id={`accept-${submission.id}`}
                  label="Accepter"
                  checked={submission.status === 'Acceptée'}
                  onCheckedChange={handleAcceptSubmission}
                  disabled={submission.status === 'Acceptée' || acceptSubmissionMutation.isPending}
                />
              </div>
            ) : null}
          </div>

          {/* Archive Badge */}
          {submission.archived_at && (
            <div className="mt-4">
              <ArchiveBadge entity={submission} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernSubmissionCard;