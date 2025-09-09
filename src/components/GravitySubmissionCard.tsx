import React, { useState } from 'react';
import { Calendar, User, MoreVertical, Clock, Send, CheckCircle, AlertCircle, Edit, FileText, DollarSign } from 'lucide-react';
import { Submission } from '@/types/submission';
import { formatCurrency, formatDate, calculateDaysRemaining } from '@/lib/formatters';

interface GravitySubmissionCardProps {
  submission: Submission | any; // Allow any to handle missing priority
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
  // Mapping des statuts de soumissions aux thèmes Gravity UI
  const getTheme = (status: string) => {
    const themes = {
      'draft': 'warning',      // À préparer - Orange
      'sent': 'normal',        // Envoyé au client - Gris
      'pending': 'info',       // En attente - Bleu
      'accepted': 'success',   // Accepté - Vert
      'rejected': 'danger'     // Refusé - Rouge
    };
    return themes[status as keyof typeof themes] || 'normal';
  };

  // Icônes par statut de soumission
  const getStatusIcon = (status: string) => {
    const icons = {
      'draft': <Edit size={14} />,
      'sent': <Send size={14} />,
      'pending': <Clock size={14} />,
      'accepted': <CheckCircle size={14} />,
      'rejected': <AlertCircle size={14} />
    };
    return icons[status as keyof typeof icons] || <FileText size={14} />;
  };

  // Transformation du statut pour l'affichage
  const getStatusLabel = (status: string) => {
    const labels = {
      'draft': 'Brouillon',
      'sent': 'Envoyée',
      'pending': 'En attente',
      'accepted': 'Acceptée',
      'rejected': 'Refusée'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const theme = getTheme(submission.status);
  const businessName = submission.clients?.business_name || 'Client inconnu';
  const contactName = submission.clients?.contact_name;
  const clientDisplay = contactName ? `${businessName} (${contactName})` : businessName;

  // Calcul des jours restants si deadline
  const deadlineInfo = submission.deadline ? calculateDaysRemaining(submission.deadline) : null;

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

      {/* Header */}
      <div className={`gravity-card-header ${onSelect ? 'ml-6' : ''}`}>
        <div>
          <h3 className="gravity-card-title">
            Soumission {submission.submission_number}
          </h3>
          <span className="gravity-card-code">
            ID: {submission.id.slice(0, 8)}...
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
      
      {/* Version/Priority */}
      <div className="gravity-card-version">
        {(submission.priority === 'high' || submission.priority === 'critical') ? (
          <span className="text-orange-600 font-semibold">
            Priorité: {submission.priority === 'critical' ? 'Critique' : 'Élevée'}
          </span>
        ) : (
          <span>Priorité {submission.priority || 'normale'}</span>
        )}
      </div>
      
      {/* Status Badge */}
      <div className={`gravity-status-badge badge-${theme}`}>
        {getStatusIcon(submission.status)}
        <span>{getStatusLabel(submission.status)}</span>
      </div>

      {/* Price Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-lg font-bold">
          <DollarSign size={18} className="text-muted-foreground" />
          <span>{formatCurrency(submission.total_price)}</span>
        </div>
      </div>

      {/* Deadline Warning if applicable */}
      {deadlineInfo && deadlineInfo.days <= 7 && (
        <div className={`text-sm font-medium mb-3 ${deadlineInfo.color}`}>
          📅 Échéance: {deadlineInfo.text}
        </div>
      )}
      
      {/* Metadata */}
      <div className="gravity-card-meta">
        <div className="gravity-meta-item">
          <Calendar size={16} />
          <span>
            {submission.sent_at 
              ? `Envoyée ${formatDate(submission.sent_at)}`
              : `Créée ${formatDate(submission.created_at)}`
            }
          </span>
        </div>
        <div className="gravity-meta-item">
          <User size={16} />
          <span title={clientDisplay}>
            {clientDisplay.length > 20 ? `${clientDisplay.slice(0, 20)}...` : clientDisplay}
          </span>
        </div>
      </div>

      {/* Tags if any */}
      {submission.tags && submission.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {submission.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
          {submission.tags.length > 3 && (
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
              +{submission.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default GravitySubmissionCard;