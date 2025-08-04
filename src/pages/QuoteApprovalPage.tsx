import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, FileText, Calendar, Euro, Building2, User, Phone, Mail, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoGregoire from '@/assets/logo-imprimerie-gregoire.png';

// Mock data - replace with actual API call
const mockQuoteData = {
  quoteNumber: 'DEVIS-2024-001',
  clientName: 'Entreprise ABC Inc.',
  contactPerson: 'Jean Dupont',
  email: 'jean.dupont@entreprise-abc.fr',
  phone: '01 23 45 67 89',
  createdDate: '15 janvier 2024',
  validUntil: '14 février 2024',
  status: 'En attente',
  items: [
    {
      id: 1,
      description: 'Cartes de visite - Papier premium mat',
      quantity: 1000,
      unitPrice: 0.15,
      total: 150.00
    },
    {
      id: 2,
      description: 'Brochures A4 - 8 pages couleur',
      quantity: 500,
      unitPrice: 2.50,
      total: 1250.00
    },
    {
      id: 3,
      description: 'Livraison express 24h',
      quantity: 1,
      unitPrice: 25.00,
      total: 25.00
    }
  ],
  subtotal: 1425.00,
  tax: 285.00,
  total: 1710.00,
  notes: 'Impression haute qualité avec finition mate. Délai de livraison standard : 5-7 jours ouvrables.'
};

export default function QuoteApprovalPage() {
  const { token } = useParams<{ token: string }>();
  const [comments, setComments] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'declined' | null>(null);

  const handleApprove = async () => {
    if (!comments.trim()) {
      // Simple alert for demo - in real app use toast
      alert('Veuillez ajouter un commentaire avant d\'approuver.');
      return;
    }
    
    setIsApproving(true);
    // Simulate API call
    setTimeout(() => {
      setIsApproving(false);
      setDecision('approved');
      setIsSubmitted(true);
    }, 1500);
  };

  const handleDecline = async () => {
    if (!comments.trim()) {
      alert('Veuillez expliquer la raison du refus.');
      return;
    }
    
    setIsDeclining(true);
    // Simulate API call
    setTimeout(() => {
      setIsDeclining(false);
      setDecision('declined');
      setIsSubmitted(true);
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className={cn(
          "mx-auto max-w-2xl",
          "px-4 py-8 sm:px-6 md:px-8"
        )}>
          <Card className={cn(
            "text-center border-border shadow-sm",
            "animate-scale-in"
          )}>
            <CardContent className="p-8 space-y-6">
              {decision === 'approved' ? (
                <>
                  <div className="flex justify-center">
                    <div className={cn(
                      "h-16 w-16 rounded-full",
                      "bg-positive-light flex items-center justify-center"
                    )}>
                      <CheckCircle className="h-8 w-8 text-positive" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-base-750 font-semibold text-positive">
                      Devis Approuvé
                    </h1>
                    <p className="text-base-300 text-muted-foreground max-w-md mx-auto">
                      Merci d'avoir approuvé le devis. Nous commencerons la production sous peu et vous tiendrons informé de l'avancement.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className={cn(
                      "h-16 w-16 rounded-full",
                      "bg-negative-light flex items-center justify-center"
                    )}>
                      <XCircle className="h-8 w-8 text-negative" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-base-750 font-semibold text-negative">
                      Devis Refusé
                    </h1>
                    <p className="text-base-300 text-muted-foreground max-w-md mx-auto">
                      Nous avons bien reçu votre refus. Notre équipe vous recontactera prochainement pour discuter de vos besoins.
                    </p>
                  </div>
                </>
              )}
              
              <div className={cn(
                "bg-muted rounded-lg p-4",
                "border border-border"
              )}>
                <p className="text-base-200 font-medium mb-2">Votre commentaire :</p>
                <p className="text-base-200 text-muted-foreground italic leading-relaxed">
                  "{comments}"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo - Uber Design Pattern */}
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
                  Approbation de Devis
                </h1>
                <p className={cn(
                  "text-xs sm:text-sm text-muted-foreground mt-1",
                  "leading-relaxed"
                )}>
                  Devis #{mockQuoteData.quoteNumber}
                </p>
              </div>
            </div>
            
            {/* Status Badge - Mobile responsive */}
            <div className="flex-shrink-0">
              <Badge 
                variant="secondary" 
                className={cn(
                  "bg-info-light text-info border-info/20",
                  "px-3 py-1 text-xs sm:text-sm font-medium"
                )}
              >
                {mockQuoteData.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className={cn(
        "mx-auto max-w-4xl",
        "px-4 py-6 sm:px-6 md:px-8",
        "pb-safe-area-inset-bottom", // Safe area for mobile
        "animate-fade-in"
      )}>
        
        {/* Subtitle Section */}
        <div className="text-center mb-6 space-y-2 px-2">
          <p className={cn(
            "text-sm sm:text-base-300 text-muted-foreground",
            "max-w-xl mx-auto leading-relaxed"
          )}>
            Veuillez examiner attentivement les détails ci-dessous et nous faire part de votre décision
          </p>
        </div>

        {/* Quote Details Grid - Mobile-optimized spacing */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Quote Information Card - Mobile-first layout */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className={cn(
                "flex items-center gap-2 sm:gap-3",
                "text-lg sm:text-base-650 font-semibold",
                "leading-tight"
              )}>
                <div className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-lg",
                  "bg-primary/10 flex items-center justify-center flex-shrink-0"
                )}>
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="truncate">Informations du Devis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {/* Mobile-stacked layout */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground flex-shrink-0">Numéro :</span>
                    <span className="text-sm font-medium text-right truncate">{mockQuoteData.quoteNumber}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      Créé le :
                    </span>
                    <span className="text-sm font-medium text-right">{mockQuoteData.createdDate}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0">
                      <AlertCircle className="h-3 w-3" />
                      Valide jusqu'au :
                    </span>
                    <Badge variant="outline" className="text-xs text-warning border-warning">
                      {mockQuoteData.validUntil}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground flex-shrink-0">Statut :</span>
                    <Badge variant="secondary" className="text-xs bg-info-light text-info">
                      {mockQuoteData.status}
                    </Badge>
                  </div>
                  {/* Prominent total on mobile */}
                  <div className={cn(
                    "flex items-center justify-between gap-2 pt-2",
                    "border-t border-border"
                  )}>
                    <span className="text-base font-medium flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      Total :
                    </span>
                    <span className="text-lg sm:text-base-550 font-bold text-primary">
                      {formatPrice(mockQuoteData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information Card - Mobile-optimized */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className={cn(
                "flex items-center gap-2 sm:gap-3",
                "text-lg sm:text-base-650 font-semibold",
                "leading-tight"
              )}>
                <div className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-lg",
                  "bg-primary/10 flex items-center justify-center flex-shrink-0"
                )}>
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="truncate">Informations Client</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <Building2 className="h-3 w-3" />
                    Entreprise :
                  </span>
                  <span className="text-sm font-medium text-right leading-tight">
                    {mockQuoteData.clientName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <User className="h-3 w-3" />
                    Contact :
                  </span>
                  <span className="text-sm font-medium text-right">{mockQuoteData.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <Mail className="h-3 w-3" />
                    Email :
                  </span>
                  <span className="text-sm font-medium text-right break-all">
                    {mockQuoteData.email}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <Phone className="h-3 w-3" />
                    Téléphone :
                  </span>
                  <span className="text-sm font-medium text-right font-mono">
                    {mockQuoteData.phone}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Items Card - Mobile-optimized scrollable */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-base-650 font-semibold">
                Détail des Articles
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                {mockQuoteData.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "p-3 sm:p-4",
                      "bg-muted/50 rounded-lg border border-border",
                      "transition-colors duration-200",
                      "overflow-hidden" // Prevent content overflow
                    )}
                  >
                    <div className="space-y-2">
                      <h4 className={cn(
                        "text-sm sm:text-base-300 font-medium",
                        "leading-tight text-foreground"
                      )}>
                        {item.description}
                      </h4>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-base-200 text-muted-foreground">
                          Qté : {item.quantity.toLocaleString('fr-FR')}
                        </p>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatPrice(item.unitPrice)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <span className="text-xs font-medium text-muted-foreground">Sous-total</span>
                        <p className="text-base font-bold text-primary">{formatPrice(item.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator className="my-4" />
                
                {/* Mobile-optimized totals */}
                <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sous-total :</span>
                    <span className="text-sm font-medium">{formatPrice(mockQuoteData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">TVA (20%) :</span>
                    <span className="text-sm font-medium">{formatPrice(mockQuoteData.tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base sm:text-base-550 font-bold">Total :</span>
                    <span className="text-lg sm:text-base-650 font-bold text-primary">
                      {formatPrice(mockQuoteData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card - Mobile-optimized text */}
          {mockQuoteData.notes && (
            <Card className="border-border shadow-sm overflow-hidden">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-base-650 font-semibold">
                  Notes et Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className={cn(
                  "text-sm sm:text-base-300 text-muted-foreground",
                  "leading-relaxed break-words"
                )}>
                  {mockQuoteData.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Decision Section - Mobile-optimized */}
        <Card className="border-border shadow-sm mt-6 overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-base-650 font-semibold">
              Votre Décision
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 space-y-5">
            <div>
              <label htmlFor="comments" className="block text-sm font-medium mb-3">
                Commentaires <span className="text-negative">*</span>
              </label>
              <Textarea
                id="comments"
                placeholder="Ajoutez vos commentaires, questions ou modifications souhaitées..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className={cn(
                  "w-full resize-none",
                  "text-sm sm:text-base-300 leading-relaxed",
                  "border-border focus-visible:ring-primary",
                  "min-h-[100px]" // Ensure sufficient height on mobile
                )}
              />
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                * Ce champ est obligatoire pour procéder à l'approbation ou au refus
              </p>
            </div>

            {/* Mobile-first button layout */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isDeclining}
                size="large"
                className={cn(
                  "w-full sm:flex-1",
                  "min-h-[48px] sm:min-h-[48px]", // Touch-friendly height
                  "bg-positive hover:bg-positive/90 text-white",
                  "shadow-sm hover:shadow-md transition-all duration-200",
                  "disabled:opacity-50",
                  "text-sm sm:text-base font-medium"
                )}
              >
                {isApproving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approbation en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Approuver le Devis
                  </span>
                )}
              </Button>
              
              <Button
                onClick={handleDecline}
                disabled={isApproving || isDeclining}
                variant="destructive"
                size="large"
                className={cn(
                  "w-full sm:flex-1",
                  "min-h-[48px] sm:min-h-[48px]", // Touch-friendly height
                  "shadow-sm hover:shadow-md transition-all duration-200",
                  "disabled:opacity-50",
                  "text-sm sm:text-base font-medium"
                )}
              >
                {isDeclining ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Refus en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Refuser le Devis
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Contact - Mobile-optimized */}
        <div className={cn(
          "mt-6 p-4 sm:p-6",
          "bg-muted/30 rounded-lg border border-border",
          "text-center"
        )}>
          <p className="text-xs sm:text-base-200 text-muted-foreground leading-relaxed">
            Pour toute question concernant ce devis :<br className="sm:hidden" />
            <a 
              href="tel:+33123456789" 
              className={cn(
                "text-primary hover:text-primary/80 font-medium",
                "transition-colors inline-block mt-1 sm:mt-0 sm:ml-1"
              )}
            >
              01 23 45 67 89
            </a>
            <span className="hidden sm:inline"> ou </span>
            <br className="sm:hidden" />
            <a 
              href="mailto:contact@imprimerie-gregoire.fr" 
              className={cn(
                "text-primary hover:text-primary/80 font-medium",
                "transition-colors inline-block mt-1 sm:mt-0 break-all"
              )}
            >
              contact@imprimerie-gregoire.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}