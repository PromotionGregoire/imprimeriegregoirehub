import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Send, FileText, MoreHorizontal, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useSubmissionDetails } from '@/hooks/useSubmissionDetails';
import { useCloneSubmission, useDeleteSubmission, useUpdateSubmissionStatus } from '@/hooks/useSubmissionActions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import StatusManager from '@/components/StatusManager';
import EmployeeAssignManager from '@/components/EmployeeAssignManager';


const SubmissionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: submission, isLoading } = useSubmissionDetails(id!);
  const cloneSubmission = useCloneSubmission();
  const deleteSubmission = useDeleteSubmission();
  const updateSubmissionStatus = useUpdateSubmissionStatus();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Soumission introuvable</p>
          <Button onClick={() => navigate('/dashboard/submissions')} className="mt-4">
            Retour aux soumissions
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Brouillon': 'outline',
      'Envoyée': 'default',
      'Acceptée': 'secondary',
      'Modification Demandée': 'destructive',
      'Refusée': 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className="text-lg px-3 py-1">
        {status}
      </Badge>
    );
  };

  const subtotal = submission.submission_items?.reduce((sum: number, item: any) => {
    return sum + (item.quantity * item.unit_price);
  }, 0) || 0;

  const taxAmount = submission.total_price ? Number(submission.total_price) - subtotal : 0;

  const handleCopyLink = () => {
    const approvalLink = `${window.location.origin}/approval/${submission.approval_token}`;
    navigator.clipboard.writeText(approvalLink);
    toast({
      title: 'Lien copié',
      description: 'Le lien d\'approbation a été copié dans le presse-papiers',
    });
  };

  const handleResendEmail = async () => {
    // TODO: Implement email resend functionality
    toast({
      title: 'Email envoyé',
      description: 'Le courriel d\'approbation a été renvoyé au client',
    });
  };

  const handleCloneSubmission = async () => {
    try {
      const newSubmission = await cloneSubmission.mutateAsync(id!);
      toast({
        title: 'Soumission clonée',
        description: `Nouvelle soumission ${newSubmission.submission_number} créée`,
      });
      navigate(`/dashboard/submissions/edit/${newSubmission.id}`);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de cloner la soumission',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubmission = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette soumission ? Cette action est irréversible.')) {
      try {
        await deleteSubmission.mutateAsync(id!);
        toast({
          title: 'Soumission supprimée',
          description: 'La soumission a été supprimée avec succès',
        });
        navigate('/dashboard/submissions');
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la soumission',
          variant: 'destructive',
        });
      }
    }
  };

  const handleMarkAsRejected = async () => {
    try {
      await updateSubmissionStatus.mutateAsync({ submissionId: id!, status: 'Refusée' });
      toast({
        title: 'Statut mis à jour',
        description: 'La soumission a été marquée comme refusée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard/submissions')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
              Soumission {submission.submission_number}
            </h1>
            <Button
              variant="link"
              className="p-0 h-auto text-primary text-sm sm:text-base truncate max-w-full"
              onClick={() => navigate(`/dashboard/clients/${submission.client_id}`)}
            >
              {submission.clients?.business_name}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusManager submission={submission} currentStatus={submission.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Clés</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Date de création</div>
                  <div className="font-medium text-base">
                    {new Date(submission.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Échéance</div>
                  <div className="font-medium text-base">
                    {submission.deadline 
                      ? new Date(submission.deadline).toLocaleDateString('fr-FR')
                      : 'Non définie'
                    }
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <div className="text-sm text-muted-foreground">Montant Total</div>
                  <div className="font-bold text-2xl sm:text-3xl text-primary">
                    ${Number(submission.total_price || 0).toFixed(2)}
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2 pt-2 border-t">
                  <div className="text-sm text-muted-foreground">Employé assigné</div>
                  <EmployeeAssignManager 
                    clientId={submission.client_id}
                    currentAssignedUserId={submission.clients?.assigned_user_id}
                    type="client"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Lines */}
          <Card className="overflow-hidden">
            <CardHeader className="p-4 sm:p-5 lg:p-6">
              <CardTitle className="text-lg font-semibold">Lignes de Produits</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 sm:px-6 py-3">Produit</TableHead>
                      <TableHead className="px-4 sm:px-6 py-3 hidden sm:table-cell">Description</TableHead>
                      <TableHead className="px-4 sm:px-6 py-3 text-center">Qté</TableHead>
                      <TableHead className="px-4 sm:px-6 py-3 text-right">Prix Unit.</TableHead>
                      <TableHead className="px-4 sm:px-6 py-3 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submission.submission_items?.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="px-4 sm:px-6 py-4 font-medium">{item.product_name}</TableCell>
                        <TableCell className="px-4 sm:px-6 py-4 text-muted-foreground hidden sm:table-cell">
                          {item.description || 'Aucune description'}
                        </TableCell>
                        <TableCell className="px-4 sm:px-6 py-4 text-center">{item.quantity}</TableCell>
                        <TableCell className="px-4 sm:px-6 py-4 text-right">
                          ${Number(item.unit_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="px-4 sm:px-6 py-4 text-right font-medium">
                          ${(item.quantity * Number(item.unit_price)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Totals Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif des Totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes:</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>GRAND TOTAL:</span>
                    <span className="text-primary">
                      ${Number(submission.total_price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Center Sidebar */}
        <div className="space-y-6">
          {/* Main Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Centre de Contrôle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => navigate(`/dashboard/submissions/edit/${submission.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier la Soumission
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleCloneSubmission}
                disabled={cloneSubmission.isPending}
              >
                <Copy className="w-4 h-4 mr-2" />
                Cloner la Soumission
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open(`/api/submissions/${submission.id}/pdf`, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Générer PDF
              </Button>
            </CardContent>
          </Card>

          {/* Client Approval Zone */}
          <Card>
            <CardHeader>
              <CardTitle>Approbation Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Lien d'approbation unique:
                </div>
                <div className="text-xs font-mono break-all">
                  /approval/{submission.approval_token || submission.id}
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier le lien
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleResendEmail}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Renvoyer le courriel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Secondaires</CardTitle>
            </CardHeader>
            <CardContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Plus d'options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={handleMarkAsRejected}
                  >
                    Marquer comme Refusée
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={handleDeleteSubmission}
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;