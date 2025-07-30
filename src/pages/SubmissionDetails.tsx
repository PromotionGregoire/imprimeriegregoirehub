import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Send, FileText, MoreHorizontal, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSubmissionDetails } from '@/hooks/useSubmissionDetails';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const SubmissionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: submission, isLoading } = useSubmissionDetails(id!);

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
    const approvalLink = `${window.location.origin}/approval/${submission.id}`;
    navigator.clipboard.writeText(approvalLink);
    toast({
      title: 'Lien copié',
      description: 'Le lien d\'approbation a été copié dans le presse-papiers',
    });
  };

  const handleResendEmail = () => {
    toast({
      title: 'Email envoyé',
      description: 'Le courriel d\'approbation a été renvoyé au client',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard/submissions')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Soumission {submission.submission_number}
            </h1>
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() => navigate(`/dashboard/clients/${submission.client_id}`)}
            >
              {submission.clients?.business_name}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {getStatusBadge(submission.status)}
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
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Date de création</div>
                  <div className="font-medium">
                    {new Date(submission.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Échéance</div>
                  <div className="font-medium">
                    {submission.deadline 
                      ? new Date(submission.deadline).toLocaleDateString('fr-FR')
                      : 'Non définie'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Montant Total</div>
                  <div className="font-bold text-2xl text-primary">
                    ${Number(submission.total_price || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Lignes de Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Qté</TableHead>
                    <TableHead className="text-right">Prix Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submission.submission_items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.description || 'Aucune description'}
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${Number(item.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.quantity * Number(item.unit_price)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Button variant="outline" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Cloner la Soumission
              </Button>
              <Button variant="outline" className="w-full justify-start">
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
                  /approval/{submission.id}
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
                  <DropdownMenuItem className="text-destructive">
                    Marquer comme Refusée
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
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