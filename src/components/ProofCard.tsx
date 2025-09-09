import { Badge } from '@/components/ui/badge';
import { Calendar, MoreVertical, Eye, Archive, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// CONSTANTES DE DESIGN - NE PAS MODIFIER
const DESIGN_SYSTEM = {
  spacing: {
    cardPadding: 20,
    sectionGap: 16,
    elementGap: 12,
    inlineGap: 8,
  },
  heights: {
    priorityBar: 4,
    header: 48,
    amountSection: 40,
    infoRow: 24,
    button: 40,
  }
};

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
    archived_at?: string | null;
    is_archived?: boolean;
    archive_reason?: string | null;
    orders: any; // JSONB type from database function
  };
}

const statusConfig = {
  'A preparer': { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
  'En préparation': { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
  'Envoyée': { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-500' },
  'En révision': { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  'Approuvée': { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
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

  const isArchived = proof.archived_at || proof.is_archived;

  return (
    <div className={`
      bg-white rounded-xl border overflow-hidden
      transition-all duration-200 hover:shadow-lg cursor-pointer
      ${isArchived ? 'opacity-75' : 'border-gray-200'}
    `}
    onClick={handleCardClick}
    >
      {/* BARRE DE STATUT - 4px */}
      <div 
        className={statusConfig[proof.status as keyof typeof statusConfig]?.bar || 'bg-gray-400'}
        style={{ height: `${DESIGN_SYSTEM.heights.priorityBar}px` }}
      />

      {/* CONTENU - Padding 20px */}
      <div style={{ padding: `${DESIGN_SYSTEM.spacing.cardPadding}px` }}>
        
        {/* HEADER - 48px */}
        <div 
          className="flex items-start justify-between"
          style={{ 
            height: `${DESIGN_SYSTEM.heights.header}px`, 
            marginBottom: `${DESIGN_SYSTEM.spacing.sectionGap}px` 
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center" style={{ gap: `${DESIGN_SYSTEM.spacing.inlineGap}px` }}>
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {proof.orders?.clients?.business_name || 'Client inconnu'}
              </h3>
              <div className={`w-2 h-2 rounded-full ${statusConfig[proof.status as keyof typeof statusConfig]?.dot || 'bg-gray-400'}`} />
              {isArchived && (
                <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-1">
                  Archivée
                </Badge>
              )}
            </div>
            <p className="text-xs font-mono text-gray-500 mt-1">
              {proof.human_id || 'Code épreuve manquant'}
            </p>
          </div>

          {/* MENU DROPDOWN */}
          <div className="menu-container relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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

        {/* VERSION - 40px */}
        <div 
          style={{ 
            height: `${DESIGN_SYSTEM.heights.amountSection}px`, 
            marginBottom: `${DESIGN_SYSTEM.spacing.sectionGap}px` 
          }}
          className="flex items-center"
        >
          <div className="px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-sm font-semibold text-gray-700">
              V{proof.version}
            </span>
          </div>
        </div>

        {/* INFORMATIONS */}
        <div style={{ marginBottom: `${DESIGN_SYSTEM.spacing.sectionGap}px` }}>
          {/* Date - 24px */}
          <div 
            className="flex items-center justify-between"
            style={{ 
              height: `${DESIGN_SYSTEM.heights.infoRow}px`, 
              marginBottom: `${DESIGN_SYSTEM.spacing.elementGap}px` 
            }}
          >
            <span className="text-sm text-gray-500">Créée le</span>
            <span className="text-sm font-medium text-gray-900">
              {format(new Date(proof.created_at), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>

          {/* Statut - 24px */}
          <div 
            className="flex items-center justify-between"
            style={{ height: `${DESIGN_SYSTEM.heights.infoRow}px` }}
          >
            <span className="text-sm text-gray-500">Statut</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              statusConfig[proof.status as keyof typeof statusConfig]?.badge || 'bg-gray-100 text-gray-700'
            }`}>
              {proof.status === 'A preparer' ? 'À préparer' : proof.status}
            </span>
          </div>
        </div>

        {/* BOUTON - 40px */}
        <button 
          onClick={handleCardClick}
          className="w-full flex items-center justify-center bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          style={{ 
            height: `${DESIGN_SYSTEM.heights.button}px`, 
            gap: `${DESIGN_SYSTEM.spacing.inlineGap}px` 
          }}
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Voir l'épreuve</span>
        </button>
      </div>
    </div>
  );
};