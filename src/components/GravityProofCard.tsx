import React from 'react';
import { Calendar, User, MoreVertical, Clock, Send, CheckCircle, AlertTriangle, FileText, Hourglass } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface GravityProofCardProps {
  proof: any;
  onClick: () => void;
  isSelected?: boolean;
  onSelect?: (e?: React.MouseEvent) => void;
}

const GravityProofCard: React.FC<GravityProofCardProps> = ({
  proof,
  onClick,
  isSelected = false,
  onSelect
}) => {
  // Mapping des statuts d'épreuves aux thèmes Gravity UI
  const getTheme = (status: string) => {
    const themes = {
      'A preparer': 'warning',              // Orange - À faire
      'En préparation': 'info',             // Bleu - En cours
      'Envoyée au client': 'purple',        // Violet - Envoyé au client
      'Modification demandée': 'danger',    // Rouge - Action requise
      'Approuvée': 'success',               // Vert - Terminé
      'En révision': 'warning'              // Orange - En révision
    };
    return themes[status as keyof typeof themes] || 'normal';
  };

  // Icônes par statut d'épreuve
  const getStatusIcon = (status: string) => {
    const icons = {
      'A preparer': <Hourglass size={16} />,
      'En préparation': <Clock size={16} />,
      'Envoyée au client': <Send size={16} />,
      'Modification demandée': <AlertTriangle size={16} />,
      'Approuvée': <CheckCircle size={16} />,
      'En révision': <FileText size={16} />
    };
    return icons[status as keyof typeof icons] || <Clock size={16} />;
  };

  const theme = getTheme(proof.status);
  const businessName = proof.orders?.clients?.business_name || proof.business_name || 'Client inconnu';
  const contactName = proof.orders?.clients?.contact_name || proof.contact_name || 'Contact inconnu';

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

      {/* Header - Nom du client et numéro d'épreuve */}
      <div className={`gravity-card-header ${onSelect ? 'ml-6' : ''}`}>
        <div>
          <h3 className="gravity-card-title">
            {businessName}
          </h3>
          <span className="gravity-card-code">
            {proof.human_id}-{proof.human_year}-{String(proof.human_seq).padStart(4, '0')}
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
      
      {/* Version */}
      <div className="gravity-card-version">
        V{proof.version}
      </div>
      
      {/* Status Badge */}
      <div className={`gravity-status-badge badge-${theme}`}>
        {getStatusIcon(proof.status)}
        <span>{proof.status}</span>
      </div>
      
      {/* Metadata */}
      <div className="gravity-card-meta">
        <div className="gravity-meta-item">
          <Calendar size={16} />
          <span>
            {formatDate(proof.created_at)}
          </span>
        </div>
        <div className="gravity-meta-item">
          <User size={16} />
          <span>{contactName}</span>
        </div>
      </div>
    </div>
  );
};

export default GravityProofCard;