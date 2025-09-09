import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Archive } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getArchiveInfo } from '@/utils/archiveUtils';

interface ArchiveBadgeProps {
  entity: any;
  className?: string;
}

export function ArchiveBadge({ entity, className }: ArchiveBadgeProps) {
  const archiveInfo = getArchiveInfo(entity);
  
  if (!archiveInfo) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-1 text-muted-foreground ${className}`}
    >
      <Archive className="h-3 w-3" />
      <span>Archivé le {formatDate(archiveInfo.archivedAt)}</span>
    </Badge>
  );
}