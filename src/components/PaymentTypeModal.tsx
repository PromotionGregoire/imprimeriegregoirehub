import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign, FileText, CheckCircle2, Building2, ArrowRightLeft, Gift, Handshake } from 'lucide-react';

interface PaymentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentType: string) => void;
  orderNumber?: string;
}

const PAYMENT_TYPES = [
  { value: 'credit', label: 'Crédit', icon: CreditCard },
  { value: 'debit', label: 'Débit', icon: CreditCard },
  { value: 'cash', label: 'Comptant', icon: DollarSign },
  { value: 'check', label: 'Chèque', icon: FileText },
  { value: 'transfer', label: 'Virement', icon: ArrowRightLeft },
  { value: 'account', label: 'Facturé au compte', icon: Building2 },
  { value: 'exchange', label: 'Échange', icon: ArrowRightLeft },
  { value: 'sponsorship', label: 'Commandite', icon: Gift }
];

const PaymentTypeModal: React.FC<PaymentTypeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber
}) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('');

  const handleConfirm = () => {
    if (selectedPaymentType) {
      onConfirm(selectedPaymentType);
      setSelectedPaymentType('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedPaymentType('');
    onClose();
  };

  const selectedType = PAYMENT_TYPES.find(type => type.value === selectedPaymentType);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Marquer comme facturé
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {orderNumber && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Commande</p>
              <p className="font-medium">{orderNumber}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="payment-type">Type de paiement utilisé</Label>
            <Select value={selectedPaymentType} onValueChange={setSelectedPaymentType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de paiement..." />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <selectedType.icon className="w-4 h-4" />
                <span className="font-medium">Paiement par {selectedType.label}</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Cette commande sera marquée comme facturée avec ce mode de paiement.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedPaymentType}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirmer la facturation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentTypeModal;