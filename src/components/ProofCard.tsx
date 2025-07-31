import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface ProofCardProps {
  proof: {
    id: string;
    order_id: string;
    status: string;
    version: number;
    created_at: string;
    orders: {
      order_number: string;
      clients: {
        business_name: string;
        contact_name: string;
      };
    };
  };
}

const statusColors = {
  'A preparer': 'bg-[hsl(var(--status-orange-light))] text-[hsl(var(--status-orange))] border-[hsl(var(--status-orange))]/20',
  'En préparation': 'bg-blue-50 text-blue-700 border-blue-200',
  'Envoyée': 'bg-[hsl(var(--status-purple-light))] text-[hsl(var(--status-purple))] border-[hsl(var(--status-purple))]/20',
  'En révision': 'bg-amber-50 text-amber-700 border-amber-200',
  'Approuvée': 'bg-[hsl(var(--status-green-light))] text-[hsl(var(--status-green))] border-[hsl(var(--status-green))]/20',
};

export const ProofCard = ({ proof }: ProofCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/dashboard/proofs/${proof.id}`);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] bg-card border-border/50"
      onClick={handleCardClick}
    >
      <CardContent className="p-5 md:p-6 space-y-4">
        {/* Header avec nom entreprise proéminent */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg md:text-base text-foreground leading-tight group-hover:text-primary transition-colors">
            {proof.orders?.clients?.business_name || 'Client inconnu'}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
            <p className="text-sm text-muted-foreground font-medium">
              {proof.orders?.order_number || 'N° de commande manquant'}
            </p>
          </div>
        </div>

        {/* Version et statut avec design moderne */}
        <div className="flex items-center justify-between pt-2">
          <div className="px-3 py-1 bg-primary/5 rounded-full">
            <span className="text-sm font-semibold text-primary">
              V{proof.version}
            </span>
          </div>
          <Badge 
            className={`text-xs font-semibold px-3 py-1 ${statusColors[proof.status as keyof typeof statusColors] || 'bg-muted text-muted-foreground border-muted'}`}
          >
            {proof.status === 'A preparer' ? 'À préparer' : proof.status}
          </Badge>
        </div>

        {/* Footer avec date et contact */}
        <div className="pt-3 border-t border-border/40">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">
                {format(new Date(proof.created_at), 'dd MMM yyyy', { locale: fr })}
              </span>
            </div>
            {proof.orders?.clients?.contact_name && (
              <span className="font-medium text-foreground/70 truncate max-w-24">
                {proof.orders.clients.contact_name}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};