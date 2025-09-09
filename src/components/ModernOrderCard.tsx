import React, { useState } from 'react';
import { MoreVertical, Eye, Package, Archive, RefreshCw, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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

interface ModernOrderCardProps {
  order: any;
  onClick: () => void;
  isSelected?: boolean;
  onSelect?: (e?: React.MouseEvent) => void;
  onProofAccepted: (orderId: string) => void;
  onDelivered: (orderId: string) => void;
}

const ModernOrderCard = ({
  order,
  onClick,
  isSelected = false,
  onSelect,
  onProofAccepted,
  onDelivered
}: ModernOrderCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Configuration des couleurs de priorité basée sur le statut
  const getPriority = () => {
    switch (order.status) {
      case 'En attente de l\'épreuve': return 'high';
      case 'En production': return 'normal';
      case 'Complétée': return 'low';
      default: return 'normal';
    }
  };

  const priority = getPriority();

  const priorityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    normal: 'bg-yellow-400',
    low: 'bg-green-500'
  };

  const statusConfig = {
    'En attente de l\'épreuve': { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
    'En production': { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
    'Complétée': { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' }
  };

  // Formatage montant
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  // Formatage date
  const formatDate = (date: string | null) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-CA');
  };

  const handleMenuAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    
    switch (action) {
      case 'details':
        onClick();
        break;
      case 'proof':
        if (order.status === 'En attente de l\'épreuve') {
          onProofAccepted(order.id);
        }
        break;
      case 'delivered':
        if (order.status === 'En production') {
          onDelivered(order.id);
        }
        break;
      case 'archive':
        // Handle archive
        break;
      case 'delete':
        // Handle delete
        break;
    }
  };

  const isProofAccepted = order.status === 'En production' || order.status === 'Complétée';
  const isDelivered = order.status === 'Complétée';

  return (
    <div className={`
      bg-white rounded-xl border overflow-hidden
      transition-all duration-200 hover:shadow-lg
      ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}
    `}>
      {/* BARRE DE PRIORITÉ - 4px */}
      <div 
        className={priorityColors[priority]}
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
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.();
                }}
                className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center" style={{ gap: `${DESIGN_SYSTEM.spacing.inlineGap}px` }}>
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {order.clients?.business_name || 'Client Non Défini'}
                </h3>
                <div className={`w-2 h-2 rounded-full ${statusConfig[order.status]?.dot || 'bg-gray-400'}`} />
              </div>
              <p className="text-xs font-mono text-gray-500 mt-1">
                {order.order_number}
              </p>
              <div className="flex items-center mt-1" style={{ gap: '4px' }}>
                <Package className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-500">
                  Soumission: {order.submissions?.submission_number || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* MENU DROPDOWN */}
          <div className="relative">
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
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMenuOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <button 
                    onClick={(e) => handleMenuAction('details', e)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>Voir détails</span>
                  </button>
                  
                  {!isProofAccepted && (
                    <button 
                      onClick={(e) => handleMenuAction('proof', e)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                      <span>Marquer épreuve acceptée</span>
                    </button>
                  )}
                  
                  {isProofAccepted && !isDelivered && (
                    <button 
                      onClick={(e) => handleMenuAction('delivered', e)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>Marquer comme livré</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={(e) => handleMenuAction('archive', e)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Archive className="w-4 h-4 text-gray-500" />
                    <span>Archiver</span>
                  </button>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button 
                    onClick={(e) => handleMenuAction('delete', e)}
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

        {/* MONTANT - 40px */}
        <div 
          style={{ 
            height: `${DESIGN_SYSTEM.heights.amountSection}px`, 
            marginBottom: `${DESIGN_SYSTEM.spacing.sectionGap}px` 
          }}
          className="flex items-center"
        >
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(Number(order.total_price) || 0)}
          </p>
        </div>

        {/* INFORMATIONS */}
        <div style={{ marginBottom: `${DESIGN_SYSTEM.spacing.sectionGap}px` }}>
          {/* Date création - 24px */}
          <div 
            className="flex items-center justify-between"
            style={{ 
              height: `${DESIGN_SYSTEM.heights.infoRow}px`, 
              marginBottom: `${DESIGN_SYSTEM.spacing.elementGap}px` 
            }}
          >
            <span className="text-sm text-gray-500">Créée le</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(order.created_at)}
            </span>
          </div>

          {/* Statut - 24px */}
          <div 
            className="flex items-center justify-between"
            style={{ height: `${DESIGN_SYSTEM.heights.infoRow}px` }}
          >
            <span className="text-sm text-gray-500">Statut</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              statusConfig[order.status]?.badge || 'bg-gray-100 text-gray-700'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* BOUTON - 40px */}
        <button 
          onClick={onClick}
          className="w-full flex items-center justify-center bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          style={{ 
            height: `${DESIGN_SYSTEM.heights.button}px`, 
            gap: `${DESIGN_SYSTEM.spacing.inlineGap}px` 
          }}
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Voir les détails</span>
        </button>
      </div>
    </div>
  );
};

export default ModernOrderCard;