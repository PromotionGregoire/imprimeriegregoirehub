import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MoreVertical, Eye, Archive, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface ProofCardProps {
  proof: {
    id: string;
    order_id: string;
    status: string;
    version: number;
    created_at: string;
    human_id: string;
    human_year: number;
    human_seq: number;
    orders: any; // JSONB type from database function
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
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Ne navigue que si on ne clique pas sur le menu
    if (!(e.target as Element).closest('.menu-container')) {
      navigate(`/dashboard/proofs/${proof.id}`);
    }
  };

  const handleMenuAction = (action: string) => {
    setMenuOpen(false);
    switch (action) {
      case 'view':
        navigate(`/dashboard/proofs/${proof.id}`);
        break;
      case 'status':
        console.log('Change status:', proof.id);
        break;
      case 'archive':
        console.log('Archive:', proof.id);
        break;
      case 'delete':
        console.log('Delete:', proof.id);
        break;
    }
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] bg-card border-border/50 relative"
      onClick={handleCardClick}
    >
      <CardContent className="p-base-500 md:p-base-600 space-y-base-400">
        {/* Header avec nom entreprise proéminent et menu */}
        <div className="space-y-base-200">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg md:text-xl text-foreground leading-tight group-hover:text-primary transition-colors flex-1">
              {proof.orders?.clients?.business_name || 'Client inconnu'}
            </h3>
            
            {/* Menu Dropdown */}
            <div className="menu-container relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <button 
                      onClick={() => handleMenuAction('view')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span>Voir détails</span>
                    </button>
                    <button 
                      onClick={() => handleMenuAction('status')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                      <span>Changer statut</span>
                    </button>
                    <button 
                      onClick={() => handleMenuAction('archive')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <Archive className="w-4 h-4 text-gray-500" />
                      <span>Archiver</span>
                    </button>
                    <div className="border-t border-gray-100 my-2"></div>
                    <button 
                      onClick={() => handleMenuAction('delete')}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-base-200">
            <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
            <p className="text-sm text-muted-foreground font-mono">
              {proof.human_id || 'Code épreuve manquant'}
            </p>
          </div>
        </div>

        {/* Version et statut avec design moderne */}
        <div className="flex items-center justify-between pt-base-200">
          <div className="px-base-300 py-base-200 bg-primary/5 rounded-full">
            <span className="text-sm font-semibold text-primary">
              V{proof.version}
            </span>
          </div>
          <Badge 
            className={`text-xs font-semibold px-base-300 py-base-200 ${statusColors[proof.status as keyof typeof statusColors] || 'bg-muted text-muted-foreground border-muted'}`}
          >
            {proof.status === 'A preparer' ? 'À préparer' : proof.status}
          </Badge>
        </div>

        {/* Footer avec date et contact */}
        <div className="pt-base-300 border-t border-border/40">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-base-200">
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