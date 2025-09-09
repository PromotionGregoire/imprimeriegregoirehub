import React from 'react';
import { MoreVertical, Eye, Users, Archive, RefreshCw, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate, calculateDaysRemaining } from '@/lib/formatters';
import { Submission } from '@/types/submission';

// CONSTANTES DE DESIGN SYSTEM - NON NÉGOCIABLES
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
  },
  typography: {
    clientName: 'text-base font-semibold',
    referenceNumber: 'text-xs font-mono',
    amount: 'text-2xl font-bold',
    label: 'text-sm text-gray-500',
    value: 'text-sm font-medium',
    daysRemaining: 'text-xs',
    assignedTo: 'text-xs text-gray-500',
    button: 'text-sm font-medium',
  },
  colors: {
    priority: {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      normal: 'bg-yellow-400',
      low: 'bg-gray-300'
    },
    status: {
      accepted: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
      sent: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
      pending: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
      rejected: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
      draft: { dot: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700' }
    }
  }
};

interface SubmissionCardProps {
  submission: Submission;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMenuAction: (action: string, id: string) => void;
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  isSelected,
  onSelect,
  onMenuAction
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  // Calculs dérivés
  const statusConfig = DESIGN_SYSTEM.colors.status[submission.status] || DESIGN_SYSTEM.colors.status.draft;
  const priorityColor = DESIGN_SYSTEM.colors.priority[submission.priority];
  const daysInfo = calculateDaysRemaining(submission.deadline);
  
  return (
    <div 
      className={`
        bg-white rounded-xl border overflow-hidden
        transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}
      `}
      data-card
    >
      {/* BARRE DE PRIORITÉ - HAUTEUR FIXE 4px */}
      <div 
        className={`${priorityColor} ${submission.priority === 'critical' ? 'animate-pulse' : ''}`}
        style={{ height: `${DESIGN_SYSTEM.heights.priorityBar}px` }}
      />

      {/* CONTENU - PADDING FIXE 20px */}
      <div style={{ padding: `${DESIGN_SYSTEM.spacing.cardPadding}px` }}>
        
        {/* HEADER - HAUTEUR FIXE 48px */}
        <div 
          className="flex items-start justify-between"
          style={{ 
            height: `${DESIGN_SYSTEM.heights.header}px`,
            marginBottom: `${DESIGN_SYSTEM.spacing.sectionGap}px`
          }}
          data-section-gap
        >
          <div className="flex items-start flex-1 min-w-0" style={{ gap: '12px' }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(submission.id)}
              className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center" style={{ gap: `${DESIGN_SYSTEM.spacing.inlineGap}px` }}>
                <h3 className={`${DESIGN_SYSTEM.typography.clientName} text-gray-900 truncate`}>
                  {submission.clients?.business_name || 'Client inconnu'}
                </h3>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig.dot}`} />
              </div>
              <p className={`${DESIGN_SYSTEM.typography.referenceNumber} text-gray-500 mt-1`}>
                {submission.submission_number}
              </p>
              {submission.assigned_to && (
                <div className="flex items-center mt-1" style={{ gap: '4px' }}>
                  <Users className="w-3 h-3 text-gray-400" />
                  <p className={DESIGN_SYSTEM.typography.assignedTo}>
                    {submission.assigned_to}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MENU DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <button 
                    onClick={() => { onMenuAction('view', submission.id); setMenuOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>Voir détails</span>
                  </button>
                  <button 
                    onClick={() => { onMenuAction('status', submission.id); setMenuOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                    <span>Changer statut</span>
                  </button>
                  <button 
                    onClick={() => { onMenuAction('archive', submission.id); setMenuOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Archive className="w-4 h-4 text-gray-500" />
                    <span>Archiver</span>
                  </button>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button 
                    onClick={() => { onMenuAction('delete', submission.id); setMenuOpen(false); }}
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

        {/* MONTANT - HAUTEUR FIXE 40px */}
        <div 
          style={{ 
            height: `${DESIGN_SYSTEM.heights.amountSection}px`,
            marginBottom: `${DESIGN_SYSTEM.spacing.sectionGap}px`
          }}
          className="flex items-center"
          data-section-gap
        >
          <p className={`${DESIGN_SYSTEM.typography.amount} text-gray-900`}>
            {formatCurrency(submission.total_price)}
          </p>
        </div>

        {/* INFORMATIONS */}
        <div style={{ marginBottom: `${DESIGN_SYSTEM.spacing.sectionGap}px` }} data-section-gap>
          {/* Échéance - HAUTEUR FIXE 24px */}
          <div 
            className="flex items-center justify-between"
            style={{ 
              height: `${DESIGN_SYSTEM.heights.infoRow}px`,
              marginBottom: `${DESIGN_SYSTEM.spacing.elementGap}px`
            }}
          >
            <span className={DESIGN_SYSTEM.typography.label}>Échéance</span>
            <div className="flex items-center" style={{ gap: `${DESIGN_SYSTEM.spacing.inlineGap}px` }}>
              <span className={`${DESIGN_SYSTEM.typography.value} ${
                !submission.deadline ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {formatDate(submission.deadline)}
              </span>
              {daysInfo && (
                <span className={`${DESIGN_SYSTEM.typography.daysRemaining} ${daysInfo.color}`}>
                  ({daysInfo.text})
                </span>
              )}
            </div>
          </div>

          {/* Statut - HAUTEUR FIXE 24px */}
          <div 
            className="flex items-center justify-between"
            style={{ height: `${DESIGN_SYSTEM.heights.infoRow}px` }}
          >
            <span className={DESIGN_SYSTEM.typography.label}>Statut</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.badge}`}>
              {submission.status}
            </span>
          </div>
        </div>

        {/* BOUTON ACTION - HAUTEUR FIXE 40px */}
        <button 
          onClick={() => onMenuAction('proof', submission.id)}
          className="w-full flex items-center justify-center bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          style={{ 
            height: `${DESIGN_SYSTEM.heights.button}px`,
            gap: `${DESIGN_SYSTEM.spacing.inlineGap}px`
          }}
        >
          <Eye className="w-4 h-4" />
          <span className={DESIGN_SYSTEM.typography.button}>Voir l'épreuve</span>
        </button>
      </div>
    </div>
  );
};