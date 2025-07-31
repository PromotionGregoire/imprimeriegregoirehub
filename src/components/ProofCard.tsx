import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye } from 'lucide-react';

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
  'À préparer': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'En préparation': 'bg-blue-100 text-blue-800 border-blue-200',
  'Envoyée': 'bg-purple-100 text-purple-800 border-purple-200',
  'En révision': 'bg-orange-100 text-orange-800 border-orange-200',
  'Approuvée': 'bg-green-100 text-green-800 border-green-200',
};

export const ProofCard = ({ proof }: ProofCardProps) => {
  const handleCardClick = () => {
    // Future navigation to /dashboard/proofs/[id]
    console.log(`Navigate to proof details: ${proof.id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border border-border/50 hover:border-border"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {proof.orders.order_number}
              </h3>
              <p className="text-muted-foreground text-sm">
                {proof.orders.clients.business_name}
              </p>
            </div>
          </div>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Statut</span>
            <Badge 
              variant="outline" 
              className={statusColors[proof.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'}
            >
              {proof.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Version</span>
            <span className="text-sm font-semibold bg-secondary/50 px-2 py-1 rounded">
              V{proof.version}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Contact</span>
            <span className="text-sm text-muted-foreground">
              {proof.orders.clients.contact_name}
            </span>
          </div>

          <div className="pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Créée le {new Date(proof.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};