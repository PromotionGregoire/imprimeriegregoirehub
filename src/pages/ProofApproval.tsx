import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, MessageCircle, FileText, Building, Calendar, DollarSign, AlertCircle, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProofData {
  id: string;
  status: string;
  file_url: string;
  version: number;
  client_comments?: string;
  approved_at?: string;
  approved_by_name?: string;
  created_at: string;
  orders: {
    order_number: string;
    total_price: number;
    submissions: {
      submission_number: string;
      clients: {
        business_name: string;
        contact_name: string;
        contact_email: string;
      };
    };
  };
}

const ProofApproval = () => {
  const { token } = useParams<{ token: string }>();
  const [proof, setProof] = useState<ProofData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [action, setAction] = useState<'view' | 'approve' | 'modify'>('view');
  const [clientName, setClientName] = useState('');
  const [modificationComments, setModificationComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirmApproval, setShowConfirmApproval] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (token) {
      fetchProofData();
    }
  }, [token]);

  const fetchProofData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/get-proof-by-token?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement de l\'épreuve');
      }

      setProof(data.proof);
      setClientName(data.proof.orders.submissions.clients.contact_name || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!clientName.trim()) {
      setError('Veuillez entrer votre nom pour confirmer l\'approbation');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/approve-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalToken: token,
          approverName: clientName.trim(),
          confirmationWord: 'ACCEPTER'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'approbation');
      }

      setSuccess(true);
      setAction('view');
      setShowConfirmApproval(false);
      
      // Refresh proof data to show updated status
      await fetchProofData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestModification = async () => {
    if (!clientName.trim() || !modificationComments.trim()) {
      setError('Veuillez entrer votre nom et vos commentaires');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/request-proof-modification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalToken: token,
          clientComments: modificationComments.trim(),
          clientName: clientName.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi des modifications');
      }

      setSuccess(true);
      setAction('view');
      
      // Refresh proof data to show updated status
      await fetchProofData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approuvée':
        return <Badge className="bg-green-500 text-white">✅ Approuvée</Badge>;
      case 'Modification demandée':
        return <Badge className="bg-orange-500 text-white">✍️ Modification demandée</Badge>;
      case 'Envoyée au client':
        return <Badge className="bg-blue-500 text-white">📧 En attente de validation</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !proof) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Épreuve non trouvée</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                Veuillez vérifier que le lien est correct ou contactez notre équipe si le problème persiste.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!proof) return null;

  const isActionDisabled = proof.status === 'Approuvée' || proof.status === 'Modification demandée';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/logo-imprimerie-gregoire.png" 
              alt="Imprimerie Grégoire" 
              className="h-12 w-auto"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Validation de votre épreuve</h1>
              <p className="text-gray-600 mt-1">
                Épreuve pour la commande #{proof.orders.order_number}
              </p>
            </div>
          </div>
          
          {/* Status and Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {proof.orders.submissions.clients.business_name}
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Version {proof.version}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(proof.created_at), 'dd MMMM yyyy', { locale: fr })}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {formatPrice(proof.orders.total_price)}
            </div>
            {getStatusBadge(proof.status)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {proof.status === 'Approuvée' 
                ? 'Merci ! Votre épreuve a été approuvée. La production va maintenant commencer.'
                : 'Vos commentaires ont bien été transmis à notre équipe. Nous vous enverrons une nouvelle épreuve sous peu.'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        {!isActionDisabled && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-blue-800 font-medium">
                📋 Veuillez examiner attentivement l'épreuve ci-dessous. Votre approbation est nécessaire pour lancer la production.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Proof Viewer */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Aperçu de l'épreuve</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                  disabled={zoomLevel >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(1)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto bg-white" style={{ maxHeight: '70vh' }}>
              {proof.file_url ? (
                <div className="flex justify-center p-4">
                  <img
                    src={proof.file_url}
                    alt="Épreuve"
                    className="max-w-full"
                    style={{ 
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <p>Aucun fichier d'épreuve disponible</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Download Button */}
            {proof.file_url && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" asChild>
                  <a href={proof.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger l'épreuve
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!isActionDisabled && (
          <Card>
            <CardHeader>
              <CardTitle>Votre décision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {action === 'view' && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => setShowConfirmApproval(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    ✅ Approuver et Lancer la Production
                  </Button>
                  
                  <Button
                    onClick={() => setAction('modify')}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    ✍️ Demander des modifications
                  </Button>
                </div>
              )}

              {/* Approval Confirmation */}
              {showConfirmApproval && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-green-800">Confirmation d'approbation</h3>
                    <p className="text-green-700">
                      Êtes-vous certain de vouloir approuver cette épreuve ? Aucune modification ne sera possible après cette étape.
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-green-800 mb-2">
                        Votre nom (pour confirmation)
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Entrez votre nom"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleApprove}
                        disabled={processing || !clientName.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processing ? 'Approbation...' : 'Confirmer l\'approbation'}
                      </Button>
                      <Button
                        onClick={() => setShowConfirmApproval(false)}
                        variant="outline"
                      >
                        Annuler
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Modification Request Form */}
              {action === 'modify' && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-orange-800">Demande de modifications</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-orange-800 mb-2">
                        Votre nom
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Entrez votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-800 mb-2">
                        Vos commentaires ou corrections
                      </label>
                      <Textarea
                        value={modificationComments}
                        onChange={(e) => setModificationComments(e.target.value)}
                        placeholder="Décrivez les modifications souhaitées..."
                        className="min-h-[120px] border-orange-300 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleRequestModification}
                        disabled={processing || !modificationComments.trim() || !clientName.trim()}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {processing ? 'Envoi...' : 'Envoyer les modifications'}
                      </Button>
                      <Button
                        onClick={() => setAction('view')}
                        variant="outline"
                      >
                        Retour
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* Already Processed Status */}
        {isActionDisabled && (
          <Card className={cn(
            "border-2",
            proof.status === 'Approuvée' ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"
          )}>
            <CardContent className="p-6 text-center">
              <div className={cn(
                "text-6xl mb-4",
                proof.status === 'Approuvée' ? "text-green-600" : "text-orange-600"
              )}>
                {proof.status === 'Approuvée' ? '✅' : '✍️'}
              </div>
              <h2 className={cn(
                "text-2xl font-bold mb-2",
                proof.status === 'Approuvée' ? "text-green-800" : "text-orange-800"
              )}>
                {proof.status === 'Approuvée' 
                  ? 'Épreuve approuvée !' 
                  : 'Modification demandée'
                }
              </h2>
              <p className={cn(
                "text-lg",
                proof.status === 'Approuvée' ? "text-green-700" : "text-orange-700"
              )}>
                {proof.status === 'Approuvée' 
                  ? 'La production a commencé. Nous vous tiendrons informé de l\'avancement.'
                  : 'Nos équipes préparent une nouvelle version selon vos commentaires.'
                }
              </p>
              
              {proof.approved_by_name && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    {proof.status === 'Approuvée' ? 'Approuvé' : 'Demandé'} par {proof.approved_by_name}
                    {proof.approved_at && proof.status === 'Approuvée' && (
                      <> le {format(new Date(proof.approved_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</>
                    )}
                  </p>
                </div>
              )}

              {proof.client_comments && proof.status === 'Modification demandée' && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">Vos commentaires :</h4>
                  <p className="text-gray-700 text-left whitespace-pre-wrap">{proof.client_comments}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Cette page est sécurisée et accessible uniquement via le lien que vous avez reçu.
            <br />
            Pour toute question, contactez-nous : <strong>info@promotiongregoire.ca</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProofApproval;