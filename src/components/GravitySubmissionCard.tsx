import React from 'react';
import { Calendar, User, MoreVertical, Clock, Send, CheckCircle, AlertCircle, Hourglass } from 'lucide-react';
import { Submission } from '@/types/submission';
import { formatDate } from '@/lib/formatters';

interface GravitySubmissionCardProps {
  submission: Submission | any;
  onClick: () => void;
  isSelected?: boolean;
  onSelect?: (e?: React.MouseEvent) => void;
}

const GravitySubmissionCard: React.FC<GravitySubmissionCardProps> = ({
  submission,
  onClick,
  isSelected = false,
  onSelect
}) => {
  // Mapping des statuts aux thèmes Gravity UI (selon la légende des couleurs)
  const getTheme = (status: string) => {
    const themes = {
      'Brouillon': 'normal',     // Gris
      'Envoyée': 'info',         // Bleu  
      'En attente': 'warning',   // Orange
      'Acceptée': 'success',     // Vert
      'Refusée': 'danger',       // Rouge
      // Anciens statuts anglais pour compatibilité
      'draft': 'normal',
      'sent': 'info',
      'pending': 'warning', 
      'accepted': 'success',
      'rejected': 'danger'
    };
    return themes[status as keyof typeof themes] || 'normal';
  };

  // Icônes par statut
  const getStatusIcon = (status: string) => {
    const icons = {
      'Brouillon': <Hourglass size={16} />,
      'Envoyée': <Send size={16} />,
      'En attente': <Clock size={16} />,
      'Acceptée': <CheckCircle size={16} />,
      'Refusée': <AlertCircle size={16} />,
      // Anciens statuts anglais pour compatibilité
      'draft': <Hourglass size={16} />,
      'sent': <Send size={16} />,
      'pending': <Clock size={16} />,
      'accepted': <CheckCircle size={16} />,
      'rejected': <AlertCircle size={16} />
    };
    return icons[status as keyof typeof icons] || <Clock size={16} />;
  };

  // Pas besoin de transformation des labels car ils sont déjà en français
  const getStatusLabel = (status: string) => {
    return status;
  };

  const theme = getTheme(submission.status);
  const businessName = submission.clients?.business_name || 'Client inconnu';
  const contactName = submission.clients?.contact_name || 'Contact inconnu';

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

      {/* Header - Nom du client et numéro de soumission */}
      <div className={`gravity-card-header ${onSelect ? 'ml-6' : ''}`}>
        <div>
          <h3 className="gravity-card-title">
            {businessName}
          </h3>
          <span className="gravity-card-code">
            {submission.submission_number}
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
        V1
      </div>
      
      {/* Status Badge avec icône */}
      <div className={`gravity-status-badge badge-${theme}`}>
        {getStatusIcon(submission.status)}
        <span>{getStatusLabel(submission.status)}</span>
      </div>
      
      {/* Metadata - Date et contact */}
      <div className="gravity-card-meta">
        <div className="gravity-meta-item">
          <Calendar size={16} />
          <span>
            {formatDate(submission.created_at)}
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

export default GravitySubmissionCard;