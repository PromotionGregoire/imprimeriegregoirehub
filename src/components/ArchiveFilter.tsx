import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArchiveFilter as ArchiveFilterType } from '@/utils/archiveUtils';

interface ArchiveFilterProps {
  value: ArchiveFilterType;
  onChange: (value: ArchiveFilterType) => void;
  className?: string;
}

export function ArchiveFilter({ value, onChange, className }: ArchiveFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Filtrer..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="actives">🟢 Actives</SelectItem>
        <SelectItem value="archived">📦 Archivées</SelectItem>
        <SelectItem value="all">📋 Toutes</SelectItem>
      </SelectContent>
    </Select>
  );
}