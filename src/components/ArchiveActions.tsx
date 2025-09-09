import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Archive, ArchiveRestore, Loader2 } from 'lucide-react';
import { useArchiveMutations } from '@/hooks/useArchiveMutations';
import { ArchiveEntityKind, isArchived } from '@/utils/archiveUtils';

interface ArchiveActionsProps {
  entity: any;
  entityId: string;
  kind: ArchiveEntityKind;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ArchiveActions({ 
  entity, 
  entityId, 
  kind, 
  variant = 'outline',
  size = 'sm' 
}: ArchiveActionsProps) {
  const [reason, setReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { archiveMutation, unarchiveMutation } = useArchiveMutations(kind);
  
  const archived = isArchived(entity);

  const handleArchive = async () => {
    archiveMutation.mutate({ id: entityId, reason: reason.trim() || undefined });
    setIsDialogOpen(false);
    setReason('');
  };

  const handleUnarchive = async () => {
    unarchiveMutation.mutate(entityId);
  };

  if (archived) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleUnarchive}
        disabled={unarchiveMutation.isPending}
      >
        {unarchiveMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArchiveRestore className="h-4 w-4" />
        )}
        <span className="ml-2">Désarchiver</span>
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Archive className="h-4 w-4" />
          <span className="ml-2">Archiver</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archiver cet élément</DialogTitle>
          <DialogDescription>
            Cette action archivera l'élément. Il sera masqué des listes par défaut mais pourra être restauré à tout moment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Raison (optionnel)</Label>
            <Textarea
              id="reason"
              placeholder="Motif de l'archivage..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
          >
            {archiveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Archive className="h-4 w-4 mr-2" />
            )}
            Archiver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}