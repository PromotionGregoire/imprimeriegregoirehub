import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type?: 'submission' | 'order' | 'proof' | 'client' | 'general';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function StatusBadge({ 
  status, 
  type = 'general', 
  size = 'medium',
  className 
}: StatusBadgeProps) {
  
  const getStatusStyle = (status: string, type: string) => {
    // Normalize status for consistent matching
    const normalizedStatus = status.toLowerCase().trim();
    
    // Common status mappings
    const statusMap: Record<string, { bg: string; text: string; border: string }> = {
      // Positive/Success/Completed states (GREEN)
      'complétée': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'approuvée': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'approved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'acceptée': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'accepted': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'envoyée': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'envoyé': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'envoyée au client': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'sent': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'actif': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'active': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      
      // In Progress states (BLUE)
      'en cours': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'en préparation': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'en production': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'in_progress': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      
      // Warning/Attention/Pending states (AMBER)
      'a preparer': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'à préparer': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'en attente': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'en attente de l\'épreuve': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'en attente d\'épreuve': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'waiting': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      
      // Revision/Modification states (ORANGE)
      'en révision': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      'modification demandée': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      'revision': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      'needs_revision': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      
      // Neutral states (GRAY)
      'prospect': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
      'client': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
      'brouillon': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
      'draft': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
      
      // Negative/Error states
      'annulée': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      'cancelled': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      'rejetée': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      'rejected': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      'inactive': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    };

    return statusMap[normalizedStatus] || { 
      bg: 'bg-gray-50', 
      text: 'text-gray-700', 
      border: 'border-gray-200' 
    };
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-0.5 min-h-[20px]';
      case 'large':
        return 'text-base px-4 py-2 min-h-[36px]';
      default: // medium
        return 'text-sm px-3 py-1 min-h-[28px]';
    }
  };

  const style = getStatusStyle(status, type);
  const sizeClasses = getSizeClasses(size);

  return (
    <Badge
      className={cn(
        // Base styles following BaseWeb design system
        'inline-flex items-center justify-center',
        'font-medium rounded-full border',
        'transition-all duration-200 ease-out',
        'whitespace-nowrap',
        // Dynamic styles
        style.bg,
        style.text,
        style.border,
        sizeClasses,
        className
      )}
      aria-label={`Statut: ${status}`}
    >
      {status}
    </Badge>
  );
}