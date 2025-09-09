import React from 'react';
import { Calendar, User, MoreVertical, Clock, Truck, CheckCircle, FileText, CreditCard } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/formatters';

interface GravityOrderCardProps {
  order: any;
  onClick: () => void;
  isSelected?: boolean;
  onSelect?: (e?: React.MouseEvent) => void;
  onProofAccepted?: (orderId: string) => void;
  onInvoiced?: (orderId: string) => void;
  onDelivered?: (orderId: string) => void;
}

const GravityOrderCard: React.FC<GravityOrderCardProps> = ({
  order,
  onClick,
  isSelected = false,
  onSelect,
  onProofAccepted,
  onInvoiced,
  onDelivered
}) => {
  // Mapping des statuts de commandes aux thèmes Gravity UI
  const getTheme = (status: string) => {
    const themes = {
      'En attente de l\'épreuve': 'warning',  // Orange - En attente
      'En production': 'info',               // Bleu - En cours
      'Marqué Facturé': 'normal',            // Gris - Facturé
      'Complétée': 'success'                 // Vert - Terminé
    };
    return themes[status as keyof typeof themes] || 'normal';
  };

  // Icônes par statut de commande
  const getStatusIcon = (status: string) => {
    const icons = {
      'En attente de l\'épreuve': <Clock size={16} />,
      'En production': <FileText size={16} />,
      'Marqué Facturé': <CreditCard size={16} />,
      'Complétée': <CheckCircle size={16} />
    };
    return icons[status as keyof typeof icons] || <Clock size={16} />;
  };

  const theme = getTheme(order.status);
  const businessName = order.clients?.business_name || 'Client inconnu';
  const contactName = order.clients?.contact_name || 'Contact inconnu';

  const handleCardClick = (e: React.MouseEvent) => {
    if (onSelect && e.currentTarget.contains(e.target as Node)) {
      const target = e.target as HTMLElement;
      if (target.closest('.gravity-card-menu') || target.closest('input[type="checkbox"]')) {
        return;
      }
    }
    onClick();
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(e);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(e as any);
  };

  return (
    <div 
      className={`gravity-card filled theme-${theme} ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectChange}
            onClick={handleSelectClick}
            className="w-4 h-4 text-primary bg-background border-2 rounded focus:ring-primary focus:ring-2"
          />
        </div>
      )}

      {/* Header - Nom du client et numéro de commande */}
      <div className={`gravity-card-header ${onSelect ? 'ml-6' : ''}`}>
        <div>
          <h3 className="gravity-card-title">
            {businessName}
          </h3>
          <span className="gravity-card-code">
            {order.order_number}
          </span>
        </div>
        <button 
          className="gravity-card-menu" 
          aria-label="Options"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={20} />
        </button>
      </div>
      
      {/* Version - Prix total */}
      <div className="gravity-card-version">
        {formatCurrency(order.total_price)}
      </div>
      
      {/* Status Badge */}
      <div className={`gravity-status-badge badge-${theme}`}>
        {getStatusIcon(order.status)}
        <span>{order.status}</span>
      </div>
      
      {/* Metadata */}
      <div className="gravity-card-meta">
        <div className="gravity-meta-item">
          <Calendar size={16} />
          <span>
            {formatDate(order.created_at)}
          </span>
        </div>
        <div className="gravity-meta-item">
          <User size={16} />
          <span>{contactName}</span>
        </div>
      </div>

      {/* Action Buttons for status changes */}
      {(onProofAccepted || onInvoiced || onDelivered) && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          {order.status === 'En attente de l\'épreuve' && onProofAccepted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProofAccepted(order.id);
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-md hover:bg-blue-500/20 transition-colors"
            >
              Démarrer production
            </button>
          )}
          {order.status === 'En production' && onInvoiced && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInvoiced(order.id); // Open payment type modal
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-cyan-500/10 text-cyan-600 rounded-md hover:bg-cyan-500/20 transition-colors mr-2"
            >
              Marquer facturé
            </button>
          )}
          {order.status === 'Marqué Facturé' && onDelivered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelivered(order.id);
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-600 rounded-md hover:bg-green-500/20 transition-colors"
            >
              Marquer livrée
            </button>
          )}
          {order.status === 'Complétée' && (
            <div className="flex-1 px-3 py-1.5 text-xs font-medium text-green-600 text-center">
              ✅ Livraison terminée
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GravityOrderCard;