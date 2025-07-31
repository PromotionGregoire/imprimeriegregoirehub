import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Download, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProofApproval = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [showModificationForm, setShowModificationForm] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [modificationComments, setModificationComments] = useState('');
  const [clientName, setClientName] = useState('');
  const [confirmationText, setConfirmationText] = useState('');

  // Fetch proof details using approval token
  const { data: proof, isLoading, error } = useQuery({
    queryKey: ['proof-approval', token],
    queryFn: async () => {
      if (!token) throw new Error('Token required');
      
      const { data, error } = await supabase
        .from('proofs')
        .select(`
          *,
          orders!inner (
            order_number,
            clients (
              business_name,
              contact_name
            )
          )
        `)
        .eq('approval_token', token)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Épreuve non trouvée');
      
      return data;
    },
    enabled: !!token,
  });

  // Request modification mutation
  const requestModification = useMutation({
    mutationFn: async (comments: string) => {
      if (!proof) throw new Error('Proof not found');
      
      const { error } = await supabase.functions.invoke('handle-proof-decision', {
        body: {
          proofId: proof.id,
          action: 'request_modification',
          comments: comments,
          approvalToken: token
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: '✅ Demande envoyée',
        description: 'Votre demande de modification a été envoyée avec succès.',
      });
      setShowModificationForm(false);
      setModificationComments('');
    },
    onError: (error) => {
      console.error('Request modification error:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'envoyer votre demande de modification.',
        variant: 'destructive',
      });
    },
  });

  // Approve proof mutation
  const approveProof = useMutation({
    mutationFn: async (approverName: string) => {
      if (!proof) throw new Error('Proof not found');
      
      const { error } = await supabase.functions.invoke('handle-proof-decision', {
        body: {
          proofId: proof.id,
          action: 'approve',
          approverName: approverName,
          approvalToken: token
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: '✅ Épreuve approuvée',
        description: 'L\'épreuve a été approuvée avec succès. Votre commande passera en production.',
      });
      setShowApprovalForm(false);
      setClientName('');
      setConfirmationText('');
    },
    onError: (error) => {
      console.error('Approve proof error:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'approuver l\'épreuve.',
        variant: 'destructive',
      });
    },
  });

  const handleRequestModification = () => {
    if (!modificationComments.trim()) {
      toast({
        title: '❌ Commentaires requis',
        description: 'Veuillez décrire les modifications souhaitées.',
        variant: 'destructive',
      });
      return;
    }
    requestModification.mutate(modificationComments);
  };

  const handleApprove = () => {
    if (!clientName.trim()) {
      toast({
        title: '❌ Nom requis',
        description: 'Veuillez saisir votre nom complet.',
        variant: 'destructive',
      });
      return;
    }
    if (confirmationText.toUpperCase() !== 'ACCEPTER') {
      toast({
        title: '❌ Confirmation requise',
        description: 'Veuillez taper "ACCEPTER" pour confirmer.',
        variant: 'destructive',
      });
      return;
    }
    approveProof.mutate(clientName);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Envoyée au client':
        return <Badge className="bg-blue-100 text-blue-800">En attente de votre décision</Badge>;
      case 'Modification demandée':
        return <Badge className="bg-orange-100 text-orange-800">Modification demandée</Badge>;
      case 'Approuvée':
        return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Épreuve non trouvée</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Le lien que vous avez utilisé n'est plus valide ou l'épreuve n'existe pas.
            </p>
            <p className="text-sm text-muted-foreground">
              Veuillez contacter votre fournisseur pour obtenir un nouveau lien.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If already decided
  if (proof.status === 'Approuvée') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Épreuve Approuvée
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Cette épreuve a déjà été approuvée.
            </p>
            <p className="text-sm text-muted-foreground">
              Votre commande est maintenant en production.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (proof.status === 'Modification demandée') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-orange-600 flex items-center justify-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Modification Demandée
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Votre demande de modification a été envoyée.
            </p>
            <p className="text-sm text-muted-foreground">
              Vous recevrez une nouvelle épreuve dès que les modifications seront apportées.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Approbation d'Épreuve
          </h1>
          <p className="text-lg text-muted-foreground">
            Commande {proof.orders.order_number} - {proof.orders.clients.business_name}
          </p>
          <div className="mt-4">
            {getStatusBadge(proof.status)}
          </div>
        </div>

        {/* Proof Display */}
        <Card>
          <CardHeader>
            <CardTitle>Épreuve - Version {proof.version}</CardTitle>
            <CardDescription>
              Veuillez examiner attentivement cette épreuve avant de prendre votre décision
            </CardDescription>
          </CardHeader>
          <CardContent>
            {proof.file_url ? (
              <div className="space-y-4">
                {/* Preview for images */}
                {proof.file_url.toLowerCase().includes('.jpg') || 
                 proof.file_url.toLowerCase().includes('.jpeg') || 
                 proof.file_url.toLowerCase().includes('.png') ? (
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={proof.file_url} 
                      alt="Épreuve" 
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 text-center bg-muted/30">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Fichier PDF - Cliquez sur le bouton ci-dessous pour télécharger et visualiser
                    </p>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <a href={proof.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger l'épreuve
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun fichier disponible pour cette épreuve.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!showModificationForm && !showApprovalForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-16 text-lg bg-green-600 hover:bg-green-700"
              onClick={() => setShowApprovalForm(true)}
            >
              <CheckCircle className="w-6 h-6 mr-3" />
              ✅ Approuver l'épreuve
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="h-16 text-lg border-orange-300 hover:bg-orange-50"
              onClick={() => setShowModificationForm(true)}
            >
              <MessageSquare className="w-6 h-6 mr-3" />
              ✏️ Demander une modification
            </Button>
          </div>
        )}

        {/* Modification Form */}
        {showModificationForm && (
          <Card>
            <CardHeader>
              <CardTitle>Demander une modification</CardTitle>
              <CardDescription>
                Décrivez précisément les modifications que vous souhaitez apporter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="comments">Commentaires *</Label>
                <Textarea
                  id="comments"
                  placeholder="Décrivez les modifications souhaitées..."
                  value={modificationComments}
                  onChange={(e) => setModificationComments(e.target.value)}
                  rows={5}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleRequestModification}
                  disabled={requestModification.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {requestModification.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Envoyer la demande
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowModificationForm(false);
                    setModificationComments('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approval Form */}
        {showApprovalForm && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmer l'approbation</CardTitle>
              <CardDescription>
                Cette action est définitive et lancera la production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  En approuvant cette épreuve, vous confirmez que le design répond à vos attentes 
                  et autorisez le lancement de la production.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="client-name">Votre nom complet * (signature numérique)</Label>
                <Input
                  id="client-name"
                  placeholder="Ex: Jean Dupont"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmation">Tapez "ACCEPTER" pour confirmer *</Label>
                <Input
                  id="confirmation"
                  placeholder="ACCEPTER"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleApprove}
                  disabled={approveProof.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approveProof.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirmer l'approbation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowApprovalForm(false);
                    setClientName('');
                    setConfirmationText('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProofApproval;