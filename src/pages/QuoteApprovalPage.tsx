import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, FileText, Calendar, Euro, Building2, User, Phone, Mail, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className={cn(
        "mx-auto max-w-4xl",
        "px-4 py-8 sm:px-6 md:px-8",
        "animate-fade-in"
      )}>
        
        {/* Header Section - Base Web Typography */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-base-950 font-semibold text-foreground">
            Approbation de Devis
          </h1>
          <p className="text-base-300 text-muted-foreground max-w-2xl mx-auto">
            Veuillez examiner attentivement les détails ci-dessous et nous faire part de votre décision
          </p>
        </div>

        {/* Quote Details Grid */}
        <div className="grid gap-6 mb-8">
          
          {/* Quote Information Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className={cn(
                "flex items-center gap-3",
                "text-base-650 font-semibold"
              )}>
                <div className={cn(
                  "h-10 w-10 rounded-lg",
                  "bg-primary/10 flex items-center justify-center"
                )}>
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                Informations du Devis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base-200 text-muted-foreground">Numéro :</span>
                    <span className="text-base-300 font-medium">{mockQuoteData.quoteNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base-200 text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Créé le :
                    </span>
                    <span className="text-base-300 font-medium">{mockQuoteData.createdDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base-200 text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Valide jusqu'au :
                    </span>
                    <Badge variant="outline" className="text-warning border-warning">
                      {mockQuoteData.validUntil}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base-200 text-muted-foreground">Statut :</span>
                    <Badge variant="secondary" className="bg-info-light text-info">
                      {mockQuoteData.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base-200 text-muted-foreground flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      Montant total :
                    </span>
                    <span className="text-base-550 font-bold text-primary">
                      {formatPrice(mockQuoteData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className={cn(
                "flex items-center gap-3",
                "text-base-650 font-semibold"
              )}>
                <div className={cn(
                  "h-10 w-10 rounded-lg",
                  "bg-primary/10 flex items-center justify-center"
                )}>
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base-200 text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Entreprise :
                    </span>
                    <span className="text-base-300 font-medium">{mockQuoteData.clientName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base-200 text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact :
                    </span>
                    <span className="text-base-300 font-medium">{mockQuoteData.contactPerson}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base-200 text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email :
                    </span>
                    <span className="text-base-300 font-medium">{mockQuoteData.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base-200 text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone :
                    </span>
                    <span className="text-base-300 font-medium">{mockQuoteData.phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Items Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base-650 font-semibold">
                Détail des Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockQuoteData.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "flex justify-between items-start p-4",
                      "bg-muted/50 rounded-lg border border-border",
                      "transition-colors duration-200"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base-300 font-medium mb-1">{item.description}</h4>
                      <p className="text-base-200 text-muted-foreground">
                        Quantité : {item.quantity.toLocaleString('fr-FR')} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-base-400 font-bold">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base-300">Sous-total :</span>
                    <span className="text-base-300 font-medium">{formatPrice(mockQuoteData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-300">TVA (20%) :</span>
                    <span className="text-base-300 font-medium">{formatPrice(mockQuoteData.tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base-550 font-bold">Total :</span>
                    <span className="text-base-650 font-bold text-primary">
                      {formatPrice(mockQuoteData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          {mockQuoteData.notes && (
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base-650 font-semibold">
                  Notes et Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base-300 text-muted-foreground leading-relaxed">
                  {mockQuoteData.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Decision Section */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base-650 font-semibold">
              Votre Décision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="comments" className="block text-base-300 font-medium mb-3">
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
                  "text-base-300 leading-relaxed",
                  "border-border focus-visible:ring-primary"
                )}
              />
              <p className="text-base-200 text-muted-foreground mt-2">
                * Ce champ est obligatoire pour procéder à l'approbation ou au refus
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isDeclining}
                size="large"
                className={cn(
                  "flex-1 min-h-[48px]",
                  "bg-positive hover:bg-positive/90 text-white",
                  "shadow-sm hover:shadow-md transition-all duration-200",
                  "disabled:opacity-50"
                )}
              >
                {isApproving ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approbation en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
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
                  "flex-1 min-h-[48px]",
                  "shadow-sm hover:shadow-md transition-all duration-200",
                  "disabled:opacity-50"
                )}
              >
                {isDeclining ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Refus en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Refuser le Devis
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Contact */}
        <div className="text-center mt-8 p-6 bg-muted/30 rounded-lg border border-border">
          <p className="text-base-200 text-muted-foreground">
            Pour toute question concernant ce devis, contactez-nous au{' '}
            <a 
              href="tel:+33123456789" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              01 23 45 67 89
            </a>
            {' '}ou par email à{' '}
            <a 
              href="mailto:contact@imprimerie-gregoire.fr" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              contact@imprimerie-gregoire.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}