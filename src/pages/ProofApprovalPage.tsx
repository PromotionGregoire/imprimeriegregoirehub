import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, FileText, Building2, User, Mail, AlertCircle, Loader2, Download, Eye, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoGregoire from '@/assets/logo-imprimerie-gregoire.png';
import { useProofByToken } from '@/hooks/useProofByToken';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ProofApprovalPage() {
  const { token } = useParams<{ token: string }>();
  const [comments, setComments] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const { toast } = useToast();
  
  // Récupérer les données de l'épreuve
  const { data: response, isLoading, error } = useProofByToken(token);
  
  const proofData = response?.proof;
  const proofHistory = response?.proofHistory || [];
  const orderHistory = response?.orderHistory || [];

  const handleApprove = async () => {
    if (!comments.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez ajouter un commentaire avant d'approuver.",
        variant: "destructive",
      });
      return;
    }
    
    setIsApproving(true);
    
    try {
      if (proofData && token) {
        const { data, error } = await supabase.functions.invoke('handle-proof-decision', {
          body: {
            token,
            decision: 'approved',
            comments,
            clientName: proofData.orders?.submissions?.clients?.contact_name
          }
        });

        if (error) {
          console.error('Erreur lors de l\'approbation:', error);
          toast({
            title: "Erreur",
            description: "Erreur lors de l'approbation de l'épreuve",
            variant: "destructive",
          });
          return;
        }

        console.log('Épreuve approuvée avec succès:', data);
        toast({
          title: "Épreuve approuvée",
          description: "L'épreuve a été approuvée avec succès",
        });
      }
      
      setDecision('approved');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    if (!comments.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez expliquer la raison du refus.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeclining(true);
    
    try {
      if (proofData && token) {
        const { data, error } = await supabase.functions.invoke('handle-proof-decision', {
          body: {
            token,
            decision: 'rejected',
            comments,
            clientName: proofData.orders?.submissions?.clients?.contact_name
          }
        });

        if (error) {
          console.error('Erreur lors du refus:', error);
          toast({
            title: "Erreur",
            description: "Erreur lors du refus de l'épreuve",
            variant: "destructive",
          });
          return;
        }

        console.log('Épreuve refusée avec succès:', data);
        toast({
          title: "Épreuve refusée",
          description: "L'épreuve a été refusée",
        });
      }
      
      setDecision('rejected');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const isPDF = (url: string) => {
    return getFileExtension(url) === 'pdf';
  };

  const isImage = (url: string) => {
    const ext = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  // Afficher un loading si on récupère les données
  if (token && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement de l'épreuve...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si l'épreuve n'est pas trouvée
  if (token && (error || !proofData)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-negative mx-auto" />
            <h1 className="text-lg font-semibold">Épreuve non trouvée</h1>
            <p className="text-muted-foreground">
              L'épreuve demandée n'existe pas ou le lien a expiré.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className={cn(
          "mx-auto max-w-2xl",
          "px-4 py-8 sm:px-6 md:px-8"
        )}>
          <Card className={cn(
            "text-center border-border shadow-sm",
            "animate-scale-in overflow-hidden"
          )}>
            <CardContent className="p-8 space-y-6">
              {decision === 'approved' ? (
                <>
                  <div className="flex justify-center">
                    <div className={cn(
                      "h-16 w-16 rounded-full",
                      "bg-primary/10 flex items-center justify-center"
                    )}>
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-primary">
                      Épreuve Approuvée
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Merci d'avoir approuvé l'épreuve. Nous commencerons la production finale et vous tiendrons informé de l'avancement.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className={cn(
                      "h-16 w-16 rounded-full",
                      "bg-red-100 flex items-center justify-center"
                    )}>
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-red-600">
                      Épreuve Refusée
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Nous avons bien reçu votre refus. Notre équipe préparera une nouvelle version selon vos commentaires.
                    </p>
                  </div>
                </>
              )}
              
              <div className={cn(
                "bg-muted rounded-lg p-4",
                "border border-border"
              )}>
                <p className="font-medium mb-2">Votre commentaire :</p>
                <p className="text-muted-foreground italic leading-relaxed">
                  "{comments}"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!proofData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo */}
      <div className={cn(
        "bg-background/95 backdrop-blur-sm border-b border-border",
        "sticky top-0 z-50 shadow-sm"
      )}>
        <div className={cn(
          "mx-auto max-w-4xl",
          "px-4 py-4 sm:px-6 sm:py-6 md:px-8"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Logo and Branding */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={cn(
                "flex-shrink-0 p-2 sm:p-3",
                "bg-primary/10 rounded-xl border border-primary/20",
                "transition-all duration-200 hover:bg-primary/15"
              )}>
                <img 
                  src={logoGregoire} 
                  alt="Imprimerie Grégoire" 
                  className="h-8 w-auto sm:h-10 md:h-12"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={cn(
                  "text-xl sm:text-2xl md:text-3xl font-bold text-foreground",
                  "leading-tight tracking-tight"
                )}>
                  Approbation d'Épreuve
                </h1>
                <p className={cn(
                  "text-xs sm:text-sm text-muted-foreground mt-1",
                  "leading-relaxed"
                )}>
                  Commande #{proofData.orders?.order_number} - Version {proofData.version}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex-shrink-0">
              <Badge 
                variant="secondary" 
                className={cn(
                  "bg-blue-100 text-blue-800 border-blue-200",
                  "px-3 py-1 text-xs sm:text-sm font-medium"
                )}
              >
                {proofData.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className={cn(
        "mx-auto max-w-4xl",
        "px-4 py-6 sm:px-6 md:px-8",
        "pb-safe-area-inset-bottom",
        "animate-fade-in"
      )}>
        
        {/* Subtitle Section */}
        <div className="text-center mb-6 space-y-2 px-2">
          <p className={cn(
            "text-sm sm:text-base text-muted-foreground",
            "max-w-xl mx-auto leading-relaxed"
          )}>
            Veuillez examiner l'épreuve ci-dessous et nous faire part de votre décision
          </p>
        </div>

        {/* Content Grid */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Client Information Card */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className={cn(
                "flex items-center gap-2 sm:gap-3",
                "text-lg font-semibold",
                "leading-tight"
              )}>
                <div className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-lg",
                  "bg-primary/10 flex items-center justify-center flex-shrink-0"
                )}>
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="truncate">
                  Informations Client
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className={cn(
                    "text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0",
                    "whitespace-nowrap"
                  )}>
                    <Building2 className="h-3 w-3" />
                    Entreprise :
                  </span>
                  <span className={cn(
                    "text-sm font-medium text-right leading-tight",
                    "break-words max-w-[200px] sm:max-w-none"
                  )}>
                     {proofData.orders?.submissions?.clients?.business_name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={cn(
                    "text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0",
                    "whitespace-nowrap"
                  )}>
                    <User className="h-3 w-3" />
                    Contact :
                  </span>
                  <span className={cn(
                    "text-sm font-medium text-right",
                    "break-words"
                  )}>
                     {proofData.orders?.submissions?.clients?.contact_name}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className={cn(
                    "text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0",
                    "whitespace-nowrap"
                  )}>
                    <Mail className="h-3 w-3" />
                    Email :
                  </span>
                  <span className={cn(
                    "text-sm font-medium text-right leading-tight",
                    "break-all max-w-[180px] sm:max-w-none"
                  )}>
                    {proofData.orders?.submissions?.clients?.email}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proof Preview Card */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className={cn(
                "flex items-center gap-2 sm:gap-3",
                "text-lg font-semibold",
                "leading-tight"
              )}>
                <div className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-lg",
                  "bg-primary/10 flex items-center justify-center flex-shrink-0"
                )}>
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="truncate">
                  Aperçu de l'Épreuve
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {proofData.file_url ? (
                <div className="space-y-4">
                  {/* File Preview */}
                  <div className="border border-border rounded-lg overflow-hidden bg-muted/50">
                    {isImage(proofData.file_url) ? (
                      <img 
                        src={proofData.file_url}
                        alt={`Épreuve version ${proofData.version}`}
                        className="w-full h-auto max-h-[600px] object-contain"
                      />
                    ) : isPDF(proofData.file_url) ? (
                      <div className="aspect-[4/3] flex items-center justify-center bg-muted">
                        <div className="text-center space-y-4">
                          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                          <div>
                            <p className="text-lg font-medium">Document PDF</p>
                            <p className="text-sm text-muted-foreground">
                              Cliquez sur "Télécharger" pour voir le fichier complet
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] flex items-center justify-center bg-muted">
                        <div className="text-center space-y-4">
                          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                          <div>
                            <p className="text-lg font-medium">Fichier non prévisualisable</p>
                            <p className="text-sm text-muted-foreground">
                              Cliquez sur "Télécharger" pour voir le fichier
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Actions */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => window.open(proofData.file_url, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Voir en plein écran
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = proofData.file_url;
                        link.download = `epreuve-v${proofData.version}.${getFileExtension(proofData.file_url)}`;
                        link.click();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Aucun fichier d'épreuve disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des commentaires */}
          {proofHistory.length > 0 && (
            <Card className="border-border shadow-sm overflow-hidden">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className={cn(
                  "flex items-center gap-2 sm:gap-3",
                  "text-lg font-semibold",
                  "leading-tight"
                )}>
                  <div className={cn(
                    "h-8 w-8 sm:h-10 sm:w-10 rounded-lg",
                    "bg-primary/10 flex items-center justify-center flex-shrink-0"
                  )}>
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <span className="truncate">
                    Historique des commentaires
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4">
                {proofHistory.map((historyItem) => (
                  <div
                    key={historyItem.id}
                    className="border border-border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Version {historyItem.version}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(historyItem.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <Badge 
                        variant={historyItem.status === 'Approuvée' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {historyItem.status}
                      </Badge>
                    </div>
                    {historyItem.client_comments && (
                      <p className="text-sm text-foreground leading-relaxed">
                        "{historyItem.client_comments}"
                      </p>
                    )}
                    {historyItem.approved_by_name && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Par: {historyItem.approved_by_name}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Journal de bord */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className={cn(
                "flex items-center gap-2 sm:gap-3",
                "text-lg font-semibold",
                "leading-tight"
              )}>
                <div className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-lg",
                  "bg-primary/10 flex items-center justify-center flex-shrink-0"
                )}>
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="truncate">
                  Journal de bord
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {orderHistory.map((historyItem) => (
                  <div
                    key={historyItem.id}
                    className="flex gap-3 pb-3 border-b border-border last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {historyItem.action_description}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {historyItem.formatted_date}
                        </span>
                      </div>
                      {historyItem.created_by_name && (
                        <p className="text-xs text-muted-foreground">
                          Par: {historyItem.created_by_name}
                        </p>
                      )}
                      {historyItem.client_action && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Action client
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {orderHistory.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun historique disponible
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Decision Section */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className={cn(
                "flex items-center gap-2 sm:gap-3",
                "text-lg font-semibold",
                "leading-tight"
              )}>
                <div className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-lg",
                  "bg-primary/10 flex items-center justify-center flex-shrink-0"
                )}>
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="truncate">
                  Votre Décision
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-4">
              {/* Comments Textarea */}
              <div className="space-y-2">
                <label htmlFor="comments" className="text-sm font-medium">
                  Commentaires *
                </label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Veuillez partager vos commentaires sur l'épreuve..."
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>* Champ obligatoire</span>
                  <span>{comments.length}/500</span>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDecline}
                  disabled={isDeclining || isApproving}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  {isDeclining ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Refus en cours...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser l'épreuve
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || isDeclining}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Approbation...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver l'épreuve
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}