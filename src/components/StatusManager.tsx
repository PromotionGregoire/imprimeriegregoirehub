import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { useUpdateSubmissionStatus } from '@/hooks/useSubmissionActions';
import { useForceAcceptSubmission } from '@/hooks/useForceAcceptSubmission';
import { useToast } from '@/hooks/use-toast';

interface StatusManagerProps {
  submission: any;
  currentStatus: string;
}

const StatusManager = ({ submission, currentStatus }: StatusManagerProps) => {
  console.log('=== STATUS MANAGER LOADED ===');
  console.log('Submission:', submission);
  console.log('Current Status:', currentStatus);
  
  const [showForceAcceptModal, setShowForceAcceptModal] = useState(false);
  const [approverName, setApproverName] = useState('');
  const updateStatus = useUpdateSubmissionStatus();
  const forceAccept = useForceAcceptSubmission();
  const { toast } = useToast();

  const getStatusBadgeData = (status: string) => {
    switch (status) {
      case 'Acceptée':
        return { variant: 'secondary' as const, color: 'bg-[#CBE54E] text-black', text: 'Acceptée' };
      case 'Modification Demandée':
        return { variant: 'secondary' as const, color: 'bg-[#308695] text-white', text: 'Modification Demandée' };
      case 'Refusée':
        return { variant: 'destructive' as const, color: '', text: 'Refusée' };
      case 'Envoyée':
        return { variant: 'default' as const, color: '', text: 'Envoyée' };
      case 'Brouillon':
        return { variant: 'outline' as const, color: '', text: 'Brouillon' };
      default:
        return { variant: 'outline' as const, color: '', text: status };
    }
  };

  const badgeData = getStatusBadgeData(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'force_accept') {
      setShowForceAcceptModal(true);
      return;
    }

    try {
      await updateStatus.mutateAsync({ submissionId: submission.id, status: newStatus });
      toast({
        title: 'Statut mis à jour',
        description: `La soumission est maintenant "${newStatus}"`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const handleForceAccept = async () => {
    if (!approverName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer le nom de la personne autorisant',
        variant: 'destructive',
      });
      return;
    }

    try {
      await forceAccept.mutateAsync({ 
        submissionId: submission.id, 
        approvedBy: approverName 
      });
      
      toast({
        title: 'Acceptation forcée réussie',
        description: 'La soumission a été acceptée et une commande a été créée',
      });
      
      setShowForceAcceptModal(false);
      setApproverName('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de forcer l\'acceptation',
        variant: 'destructive',
      });
    }
  };

  const statusOptions = [
    { value: 'Brouillon', label: 'Marquer comme Brouillon', disabled: currentStatus === 'Brouillon' },
    { value: 'Envoyée', label: 'Marquer comme Envoyée', disabled: currentStatus === 'Envoyée' },
    { value: 'Refusée', label: 'Marquer comme Refusée', disabled: currentStatus === 'Refusée' },
    { value: 'Modification Demandée', label: 'Demande de modification', disabled: currentStatus === 'Modification Demandée' },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`p-0 h-auto font-normal ${badgeData.color || ''}`}
          >
            <Badge 
              variant={badgeData.variant}
              className={`text-lg px-3 py-1 cursor-pointer hover:opacity-80 ${badgeData.color || ''}`}
            >
              {badgeData.text}
              <ChevronDown className="ml-2 h-3 w-3" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              disabled={option.disabled || updateStatus.isPending}
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-orange-600 font-medium"
            disabled={currentStatus === 'Acceptée' || forceAccept.isPending}
            onClick={() => handleStatusChange('force_accept')}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Forcer l'acceptation manuelle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Force Accept Confirmation Modal */}
      <Dialog open={showForceAcceptModal} onOpenChange={setShowForceAcceptModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmation d'Acceptation Manuelle
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              <strong>Attention :</strong> Cette action va créer une commande officielle sans 
              l'approbation numérique formelle du client. Ceci doit être utilisé uniquement 
              en cas de confirmation verbale ou écrite externe.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="approver">Nom de la personne autorisant *</Label>
              <Input
                id="approver"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                placeholder="Ex: Jean Dupont (Client)"
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForceAcceptModal(false);
                  setApproverName('');
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleForceAccept}
                disabled={forceAccept.isPending || !approverName.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {forceAccept.isPending ? 'Traitement...' : 'Oui, forcer l\'acceptation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StatusManager;