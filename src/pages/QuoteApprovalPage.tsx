import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, FileText, Calendar, DollarSign, Building2, User, Phone, Mail } from 'lucide-react';

// Mock data - replace with actual API call
const mockQuoteData = {
  quoteNumber: 'DEVIS-2024-001',
  clientName: 'Entreprise ABC',
  contactPerson: 'Jean Dupont',
  email: 'jean.dupont@entreprise-abc.fr',
  phone: '01 23 45 67 89',
  createdDate: '2024-01-15',
  validUntil: '2024-02-14',
  status: 'En attente',
  items: [
    {
      id: 1,
      description: 'Cartes de visite - Papier premium',
      quantity: 1000,
      unitPrice: 0.15,
      total: 150.00
    },
    {
      id: 2,
      description: 'Brochures A4 - 8 pages',
      quantity: 500,
      unitPrice: 2.50,
      total: 1250.00
    },
    {
      id: 3,
      description: 'Livraison express',
      quantity: 1,
      unitPrice: 25.00,
      total: 25.00
    }
  ],
  subtotal: 1425.00,
  tax: 285.00,
  total: 1710.00,
  notes: 'Impression haute qualité avec finition mate. Délai de livraison: 5-7 jours ouvrables.'
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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto py-8">
          <Card className="text-center">
            <CardContent className="p-8">
              {decision === 'approved' ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-green-700 mb-2">
                    Devis Approuvé
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Merci d'avoir approuvé le devis. Nous commencerons la production sous peu.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-red-700 mb-2">
                    Devis Refusé
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Nous avons bien reçu votre refus. Nous vous recontacterons prochainement.
                  </p>
                </>
              )}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Votre commentaire :</p>
                <p className="text-sm text-muted-foreground italic">"{comments}"</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Approbation de Devis
          </h1>
          <p className="text-muted-foreground">
            Veuillez examiner les détails ci-dessous et donner votre décision
          </p>
        </div>

        {/* Quote Details */}
        <div className="grid gap-6 mb-8">
          {/* Quote Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations du Devis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Numéro :</span>
                    <span>{mockQuoteData.quoteNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Créé le :</span>
                    <span>{mockQuoteData.createdDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Valide jusqu'au :</span>
                    <span className="text-orange-600 font-medium">{mockQuoteData.validUntil}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Statut :</span>
                    <Badge variant="secondary">{mockQuoteData.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Montant total :</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(mockQuoteData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Entreprise :</span>
                    <span>{mockQuoteData.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Contact :</span>
                    <span>{mockQuoteData.contactPerson}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email :</span>
                    <span>{mockQuoteData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Téléphone :</span>
                    <span>{mockQuoteData.phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle>Détail des Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockQuoteData.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span>{formatPrice(mockQuoteData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%):</span>
                    <span>{formatPrice(mockQuoteData.tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(mockQuoteData.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {mockQuoteData.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{mockQuoteData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Decision Section */}
        <Card>
          <CardHeader>
            <CardTitle>Votre Décision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="comments" className="block text-sm font-medium mb-2">
                Commentaires <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="comments"
                placeholder="Ajoutez vos commentaires, questions ou modifications souhaitées..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                * Ce champ est obligatoire
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isDeclining}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isApproving ? (
                  <>Approbation en cours...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver le Devis
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleDecline}
                disabled={isApproving || isDeclining}
                variant="destructive"
                className="flex-1"
              >
                {isDeclining ? (
                  <>Refus en cours...</>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser le Devis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Pour toute question, contactez-nous au{' '}
            <a href="tel:+33123456789" className="text-primary hover:underline">
              01 23 45 67 89
            </a>{' '}
            ou par email à{' '}
            <a href="mailto:contact@imprimerie-gregoire.fr" className="text-primary hover:underline">
              contact@imprimerie-gregoire.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}