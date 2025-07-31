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
  const [showThankYou, setShowThankYou] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'modification' | null>(null);

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
      if (!proof || !clientName.trim()) throw new Error('Données manquantes');
      
      const { error } = await supabase.functions.invoke('request-proof-modification', {
        body: {
          approvalToken: token,
          clientComments: comments,
          clientName: clientName
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setActionType('modification');
      setShowThankYou(true);
      setShowModificationForm(false);
      setModificationComments('');
      setClientName('');
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
      
      const { error } = await supabase.functions.invoke('approve-proof', {
        body: {
          approvalToken: token,
          approverName: approverName,
          confirmationWord: confirmationText
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setActionType('approved');
      setShowThankYou(true);
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
    if (!clientName.trim()) {
      toast({
        title: '❌ Nom requis',
        description: 'Veuillez saisir votre nom complet.',
        variant: 'destructive',
      });
      return;
    }
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

  // Thank you pages after actions
  if (showThankYou && actionType === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-6">
        <Card className="max-w-2xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">🎉 Épreuve Approuvée !</CardTitle>
            <CardDescription className="text-lg text-green-700 mt-2">
              Merci pour votre approbation - La production commence maintenant
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ce qui se passe maintenant :</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Votre épreuve a été officiellement approuvée</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Votre commande {proof?.orders.order_number} est passée en production</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Vous recevrez une notification dès la fin de production</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Notre équipe vous contactera pour la livraison</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600">
              Merci de votre confiance ! Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                📧 Un email de confirmation a été envoyé à votre adresse
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showThankYou && actionType === 'modification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-6">
        <Card className="max-w-2xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 text-orange-600 rounded-full mx-auto mb-4">
              <MessageSquare className="w-10 h-10" />
            </div>
            <CardTitle className="text-3xl font-bold text-orange-800">📝 Demande Envoyée !</CardTitle>
            <CardDescription className="text-lg text-orange-700 mt-2">
              Votre demande de modification a été transmise à notre équipe
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prochaines étapes :</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Notre équipe examine vos commentaires</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Les modifications seront apportées rapidement</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Vous recevrez une nouvelle épreuve par email</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Vous pourrez alors approuver la version révisée</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600">
              Nous nous efforçons de traiter toutes les demandes de modification dans les plus brefs délais.
            </p>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-800">
                📧 Un accusé de réception a été envoyé à votre adresse
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Professional Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            {/* Logo placeholder - can be customized */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Révision de l'épreuve pour la commande {proof.orders.order_number}
            </h1>
            <p className="text-lg text-gray-600">
              {proof.orders.clients.business_name}
            </p>
            <div className="mt-4">
              {getStatusBadge(proof.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Professional Proof Viewer */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Épreuve - Version {proof.version}</CardTitle>
                <CardDescription className="text-base mt-1">
                  Veuillez examiner attentivement cette épreuve avant de prendre votre décision
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Créée le</div>
                <div className="font-medium">{new Date(proof.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {proof.file_url ? (
              <div className="space-y-6">
                {/* Enhanced Preview */}
                {proof.file_url.toLowerCase().includes('.jpg') || 
                 proof.file_url.toLowerCase().includes('.jpeg') || 
                 proof.file_url.toLowerCase().includes('.png') ? (
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={proof.file_url} 
                      alt={`Épreuve ${proof.orders.order_number}`}
                      className="w-full h-auto max-h-[600px] object-contain bg-white"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Fichier PDF Épreuve</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Cliquez sur le bouton de téléchargement ci-dessous pour visualiser votre épreuve en haute qualité
                    </p>
                  </div>
                )}

                {/* Enhanced Download Button */}
                <div className="flex justify-center">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 px-8 text-base font-medium border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                    asChild
                  >
                    <a href={proof.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-5 h-5 mr-3" />
                      Télécharger l'épreuve
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun fichier disponible</h3>
                <p className="text-gray-500">
                  L'épreuve est en cours de préparation. Vous recevrez un nouvel email dès qu'elle sera prête.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Action Buttons */}
        {!showModificationForm && !showApprovalForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Approve Button */}
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-green-200 hover:border-green-300">
              <CardContent className="p-8" onClick={() => setShowApprovalForm(true)}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">✅ Approuver l'épreuve</h3>
                  <p className="text-gray-600">
                    Confirmer que l'épreuve répond à vos attentes et lancer la production
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Request Modification Button */}
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-orange-200 hover:border-orange-300">
              <CardContent className="p-8" onClick={() => setShowModificationForm(true)}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-4 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">✏️ Demander une modification</h3>
                  <p className="text-gray-600">
                    Demander des ajustements ou des changements sur cette épreuve
                  </p>
                </div>
              </CardContent>
            </Card>
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
                <Label htmlFor="modification-client-name">Votre nom complet *</Label>
                <Input
                  id="modification-client-name"
                  placeholder="Ex: Jean Dupont"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
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