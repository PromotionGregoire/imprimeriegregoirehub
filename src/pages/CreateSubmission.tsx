import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useCreateSubmission, SubmissionItem } from '@/hooks/useSubmissions';
import { useToast } from '@/hooks/use-toast';

const CreateSubmission = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client_id');
  const { toast } = useToast();
  
  const { data: clients, isLoading: clientsLoading } = useClients();
  const createSubmissionMutation = useCreateSubmission();
  
  const [selectedClientId, setSelectedClientId] = useState(clientId || '');
  const [deadline, setDeadline] = useState('');
  const [items, setItems] = useState<SubmissionItem[]>([
    { product_name: '', description: '', quantity: 1, unit_price: 0 }
  ]);
  const [tpsEnabled, setTpsEnabled] = useState(false);
  const [tvqEnabled, setTvqEnabled] = useState(false);
  const [customTaxAmount, setCustomTaxAmount] = useState(0);

  const selectedClient = clients?.find(client => client.id === selectedClientId);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  
  const tpsAmount = tpsEnabled ? subtotal * 0.05 : 0;
  const tvqAmount = tvqEnabled ? subtotal * 0.09975 : 0;
  const taxAmount = tpsAmount + tvqAmount + ((!tpsEnabled && !tvqEnabled) ? customTaxAmount : 0);
  const totalPrice = subtotal + taxAmount;

  const addItem = () => {
    setItems([...items, { product_name: '', description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof SubmissionItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleSubmit = async (status: 'Brouillon' | 'Envoyée') => {
    if (!selectedClientId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }

    if (items.some(item => !item.product_name.trim())) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom de tous les produits",
        variant: "destructive",
      });
      return;
    }

    try {
      const submission = await createSubmissionMutation.mutateAsync({
        submissionData: {
          client_id: selectedClientId,
          deadline: deadline || undefined,
          items: items.filter(item => item.product_name.trim()),
          subtotal,
          tax_amount: taxAmount,
          total_price: totalPrice
        },
        status
      });

      toast({
        title: "Succès",
        description: status === 'Brouillon' 
          ? "Soumission sauvegardée en brouillon" 
          : "Soumission envoyée au client",
      });

      navigate(`/dashboard/clients/${selectedClientId}`);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la soumission",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Nouvelle Soumission</h1>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Informations Générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client *</Label>
                  {clientId ? (
                    <Input
                      value={selectedClient?.business_name || 'Chargement...'}
                      disabled
                      className="bg-muted"
                    />
                  ) : (
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.business_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    value={new Date().toLocaleDateString('fr-FR')}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Date d'échéance</Label>
                  <Input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lignes de Produits */}
          <Card>
            <CardHeader>
              <CardTitle>Lignes de Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-3">
                      <Label>Nom du produit *</Label>
                      <Input
                        value={item.product_name}
                        onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                        placeholder="Ex: Impression cartes"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Description</Label>
                      <Textarea
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Détails du produit"
                        className="min-h-[40px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Qté</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Prix unitaire</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Total</Label>
                      <div className="h-10 flex items-center px-3 bg-muted rounded text-sm font-medium">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" onClick={addItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calcul des Totaux */}
          <Card>
            <CardHeader>
              <CardTitle>Calcul des Totaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={tpsEnabled}
                      onCheckedChange={(checked) => setTpsEnabled(checked === true)}
                    />
                    <Label>TPS (5%)</Label>
                    {tpsEnabled && <span className="ml-auto">${tpsAmount.toFixed(2)}</span>}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={tvqEnabled}
                      onCheckedChange={(checked) => setTvqEnabled(checked === true)}
                    />
                    <Label>TVQ (9.975%)</Label>
                    {tvqEnabled && <span className="ml-auto">${tvqAmount.toFixed(2)}</span>}
                  </div>
                  
                  {!tpsEnabled && !tvqEnabled && (
                    <div className="flex items-center space-x-2">
                      <Label>Taxes personnalisées:</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customTaxAmount}
                        onChange={(e) => setCustomTaxAmount(parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Final:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => handleSubmit('Brouillon')}
              disabled={createSubmissionMutation.isPending}
            >
              Enregistrer comme Brouillon
            </Button>
            <Button
              onClick={() => handleSubmit('Envoyée')}
              disabled={createSubmissionMutation.isPending}
            >
              Enregistrer et Envoyer par Courriel
            </Button>
          </div>
        </div>
      </div>
    );
  };

export default CreateSubmission;