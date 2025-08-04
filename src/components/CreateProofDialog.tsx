import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

export const CreateProofDialog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: ordersNeedingProofs, isLoading } = useQuery({
    queryKey: ['orders-needing-proofs'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          created_at,
          clients (
            business_name,
            contact_name
          ),
          proofs (
            id,
            version,
            status
          )
        `)
        .or('status.eq.En attente de l\'épreuve,status.eq.En production')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return orders?.filter(order => {
        const hasNoProof = !order.proofs || order.proofs.length === 0;
        const needsNewVersion = order.proofs?.some(p => p.status === 'Modification demandée');
        return hasNoProof || needsNewVersion;
      }) || [];
    },
  });

  const handleCreateProof = async () => {
    if (!selectedOrderId) {
      toast({
        title: "❌ Erreur",
        description: "Veuillez sélectionner une commande",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const selectedOrder = ordersNeedingProofs?.find(o => o.id === selectedOrderId);
      if (!selectedOrder) throw new Error('Commande non trouvée');

      const existingProofs = selectedOrder.proofs || [];
      const nextVersion = existingProofs.length + 1;

      const { data: newProof, error } = await supabase
        .from('proofs')
        .insert({
          order_id: selectedOrderId,
          version: nextVersion,
          status: 'À préparer',
          approval_token: crypto.randomUUID(),
          validation_token: crypto.randomUUID(),
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Épreuve créée",
        description: `Épreuve version ${nextVersion} créée pour la commande ${selectedOrder.order_number}`,
      });

      navigate(`/dashboard/proofs/${newProof.id}`);
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création de l\'épreuve:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer l'épreuve",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nouvelle épreuve
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Créer une nouvelle épreuve
          </DialogTitle>
          <DialogDescription>
            Sélectionnez la commande pour laquelle vous souhaitez créer une épreuve.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Une épreuve doit être associée à une commande existante. 
              Les commandes listées ci-dessous nécessitent une épreuve.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="order-select">Commande</Label>
            <Select
              value={selectedOrderId}
              onValueChange={setSelectedOrderId}
              disabled={isLoading}
            >
              <SelectTrigger id="order-select">
                <SelectValue placeholder={
                  isLoading ? "Chargement..." : "Sélectionner une commande"
                } />
              </SelectTrigger>
              <SelectContent>
                {ordersNeedingProofs?.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucune commande ne nécessite d'épreuve
                  </div>
                ) : (
                  ordersNeedingProofs?.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">{order.order_number}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-sm">{order.clients?.business_name}</span>
                        {order.proofs?.some(p => p.status === 'Modification demandée') && (
                          <span className="text-xs text-orange-600 ml-2">
                            (Modification demandée)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedOrderId && (
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">
                Cette action va créer :
              </p>
              <ul className="text-sm space-y-1">
                <li>• Une nouvelle épreuve en statut "À préparer"</li>
                <li>• Vous pourrez ensuite téléverser le fichier</li>
                <li>• L'épreuve pourra être envoyée au client</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateProof}
            disabled={!selectedOrderId || creating}
          >
            {creating ? 'Création...' : 'Créer l\'épreuve'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};