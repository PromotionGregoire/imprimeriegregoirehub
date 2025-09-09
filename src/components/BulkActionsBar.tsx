import React, { useState } from 'react';
import { RefreshCw, Users, Archive, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBulkActions } from '@/hooks/useSubmissionsData';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  selectedIds,
  onClearSelection,
}) => {
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [showAssignSelect, setShowAssignSelect] = useState(false);
  const { updateStatus, assign, archive, delete: deleteSubmissions, isLoading } = useBulkActions();

  const handleStatusChange = (status: string) => {
    updateStatus({ ids: selectedIds, status });
    setShowStatusSelect(false);
    onClearSelection();
  };

  const handleAssignChange = (assignedTo: string) => {
    assign({ ids: selectedIds, assignedTo });
    setShowAssignSelect(false);
    onClearSelection();
  };

  const handleArchive = () => {
    if (confirm(`Êtes-vous sûr de vouloir archiver ${selectedCount} soumission(s) ?`)) {
      archive(selectedIds);
      onClearSelection();
    }
  };

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${selectedCount} soumission(s) ?`)) {
      deleteSubmissions(selectedIds);
      onClearSelection();
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Selection Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {selectedCount}
              </div>
              <span className="text-sm text-gray-700">
                <span className="hidden sm:inline">
                  {selectedCount === 1 ? 'soumission sélectionnée' : 'soumissions sélectionnées'}
                </span>
                <span className="sm:hidden">
                  sélectionnée{selectedCount > 1 ? 's' : ''}
                </span>
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Annuler</span>
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Status Change */}
            {showStatusSelect ? (
              <Select onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Nouveau statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusSelect(true)}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Statut</span>
              </Button>
            )}

            {/* Assignment */}
            {showAssignSelect ? (
              <Select onValueChange={handleAssignChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Assigner à" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
                  <SelectItem value="Marie Martin">Marie Martin</SelectItem>
                  <SelectItem value="Pierre Durand">Pierre Durand</SelectItem>
                  <SelectItem value="">Non assigné</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignSelect(true)}
                disabled={isLoading}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Assigner</span>
              </Button>
            )}

            {/* Archive */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={isLoading}
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Archiver</span>
            </Button>

            {/* Delete */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Supprimer</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};