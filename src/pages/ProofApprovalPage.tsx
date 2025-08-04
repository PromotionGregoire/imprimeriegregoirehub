import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  MessageCircle, 
  FileText, 
  Building, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  User,
  Package,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProofDetails {
  proof: {
    id: string;
    version: number;
    status: string;
    file_url: string;
    created_at: string;
  };
  order: {
    id: string;
    order_number: string;
    total_price: number;
    status: string;
  };
  submission: {
    id: string;
    submission_number: string;
    items: Array<{
      id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      description: string;
    }>;
  };
  client: {
    business_name: string;
    contact_name: string;
    contact_email: string;
  };
}

const ProofApprovalPage = () => {
  const { token } = useParams<{ token: string }>();
  const [proofData, setProofData] = useState<ProofDetails | null>(null);
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
      setError('');
      
      const response = await fetch(
        `https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/get-public-proof-details?token=${token}`
      );
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement de l\'épreuve');
      }

      setProofData(data);
      setClientName(data.client?.contact_name || '');
    } catch (err: any) {
      console.error('Error fetching proof data:', err);
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
      setError('');
      
      const response = await fetch('https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/handle-proof-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          decision: 'approved',
          clientName: clientName.trim()
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
      console.error('Error approving proof:', err);
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
      setError('');
      
      const response = await fetch('https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/handle-proof-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          decision: 'rejected',
          clientName: clientName.trim(),
          comments: modificationComments.trim()
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
      console.error('Error requesting modification:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approuvée':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
            <Check className="w-3 h-3 mr-1" />
            Approuvée
          </Badge>
        );
      case 'Modification demandée':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
            <MessageCircle className="w-3 h-3 mr-1" />
            Modification demandée
          </Badge>
        );
      case 'Envoyée au client':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
            <Mail className="w-3 h-3 mr-1" />
            En attente de validation
          </Badge>
        );
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !proofData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Épreuve non trouvée</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">
                Veuillez vérifier que le lien est correct ou contactez notre équipe si le problème persiste.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proofData) return null;

  const isActionDisabled = proofData.proof.status === 'Approuvée' || proofData.proof.status === 'Modification demandée';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <img 
                  src="/logo-imprimerie-gregoire.png" 
                  alt="Imprimerie Grégoire" 
                  className="h-10 w-auto"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Validation de votre épreuve
                </h1>
                <p className="text-gray-600 mt-1">
                  Commande #{proofData.order.order_number} • Version {proofData.proof.version}
                </p>
              </div>
            </div>
            <div className="sm:ml-auto">
              {getStatusBadge(proofData.proof.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <Alert className="mb-8 border-green-200 bg-green-50/80 backdrop-blur-sm rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <AlertDescription className="text-green-800 font-medium">
                {proofData.proof.status === 'Approuvée' 
                  ? 'Parfait ! Votre épreuve a été approuvée. La production va maintenant commencer.'
                  : 'Vos commentaires ont bien été transmis à notre équipe. Nous vous enverrons une nouvelle épreuve sous peu.'
                }
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50/80 backdrop-blur-sm rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Instructions */}
        {!isActionDisabled && (
          <Card className="mb-8 border-0 shadow-lg bg-blue-50/80 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Instructions importantes</h3>
                  <p className="text-blue-800 leading-relaxed">
                    Veuillez examiner attentivement l'épreuve ci-dessous. Une fois approuvée, 
                    aucune modification ne sera possible et la production commencera immédiatement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Proof Viewer */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Aperçu de l'épreuve
                  </CardTitle>
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                      disabled={zoomLevel <= 0.5}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 min-w-[60px] text-center font-medium">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                      disabled={zoomLevel >= 2}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoomLevel(1)}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-0 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100" style={{ maxHeight: '70vh' }}>
                  {proofData.proof.file_url ? (
                    <div className="flex justify-center p-8">
                      <img
                        src={proofData.proof.file_url}
                        alt="Épreuve"
                        className="max-w-full rounded-xl shadow-lg"
                        style={{ 
                          transform: `scale(${zoomLevel})`,
                          transformOrigin: 'top center',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8" />
                        </div>
                        <p className="font-medium">Aucun fichier d'épreuve disponible</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Download Button */}
                {proofData.proof.file_url && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <Button variant="outline" asChild className="w-full rounded-xl">
                      <a href={proofData.proof.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger l'épreuve en haute qualité
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {!isActionDisabled && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Votre décision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {action === 'view' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        onClick={() => setShowConfirmApproval(true)}
                        className="h-14 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium"
                        size="lg"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Approuver et Lancer la Production
                      </Button>
                      
                      <Button
                        onClick={() => setAction('modify')}
                        variant="outline"
                        className="h-14 border-2 border-orange-200 hover:bg-orange-50 text-orange-700 rounded-xl font-medium"
                        size="lg"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Demander des modifications
                      </Button>
                    </div>
                  )}

                  {/* Approval Confirmation */}
                  {showConfirmApproval && (
                    <Card className="border-2 border-green-200 bg-green-50/50 rounded-xl">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-900 mb-2">Confirmation d'approbation</h3>
                            <p className="text-green-800 leading-relaxed">
                              Êtes-vous certain de vouloir approuver cette épreuve ? Aucune modification ne sera possible après cette étape.
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="approver-name" className="text-green-800 font-medium">
                            Votre nom (pour confirmation)
                          </Label>
                          <Input
                            id="approver-name"
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="border-green-300 focus:border-green-500 focus:ring-green-500 rounded-xl"
                            placeholder="Entrez votre nom complet"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleApprove}
                            disabled={processing || !clientName.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                          >
                            {processing ? 'Approbation en cours...' : 'Confirmer l\'approbation'}
                          </Button>
                          <Button
                            onClick={() => setShowConfirmApproval(false)}
                            variant="outline"
                            className="rounded-xl"
                          >
                            Annuler
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Modification Request Form */}
                  {action === 'modify' && (
                    <Card className="border-2 border-orange-200 bg-orange-50/50 rounded-xl">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                            <MessageCircle className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-orange-900 mb-2">Demande de modifications</h3>
                            <p className="text-orange-800 leading-relaxed">
                              Décrivez précisément les modifications souhaitées. Plus vous serez détaillé, plus nous pourrons répondre efficacement à vos attentes.
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="modifier-name" className="text-orange-800 font-medium">
                              Votre nom
                            </Label>
                            <Input
                              id="modifier-name"
                              type="text"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                              placeholder="Entrez votre nom complet"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="modification-comments" className="text-orange-800 font-medium">
                              Vos commentaires ou corrections
                            </Label>
                            <Textarea
                              id="modification-comments"
                              value={modificationComments}
                              onChange={(e) => setModificationComments(e.target.value)}
                              placeholder="Décrivez les modifications souhaitées en détail..."
                              className="min-h-[120px] border-orange-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleRequestModification}
                            disabled={processing || !modificationComments.trim() || !clientName.trim()}
                            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                          >
                            {processing ? 'Envoi en cours...' : 'Envoyer les modifications'}
                          </Button>
                          <Button
                            onClick={() => setAction('view')}
                            variant="outline"
                            className="rounded-xl"
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Information */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Détails de la commande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Building className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Entreprise</p>
                      <p className="font-medium text-gray-900">{proofData.client.business_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <User className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-gray-900">{proofData.client.contact_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Date d'épreuve</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(proofData.proof.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Montant total</p>
                      <p className="font-medium text-gray-900">{formatPrice(proofData.order.total_price)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Produits commandés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {proofData.submission.items.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">{item.product_name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Quantité: <span className="font-medium">{item.quantity}</span></p>
                      <p>Prix unitaire: <span className="font-medium">{formatPrice(item.unit_price)}</span></p>
                      {item.description && (
                        <p className="text-gray-500 italic">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">Besoin d'aide ?</h3>
                  <p className="text-blue-800 text-sm leading-relaxed mb-4">
                    Notre équipe est là pour vous accompagner dans le processus de validation.
                  </p>
                  <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl">
                    Nous contacter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofApprovalPage;