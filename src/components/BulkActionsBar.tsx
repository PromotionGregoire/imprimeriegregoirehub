import React, { useState } from 'react';
import { RefreshCw, Users, Archive, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBulkActions } from '@/hooks/useSubmissionsData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  // Récupérer la liste des employés pour l'assignation
  const { data: employees } = useQuery({
    queryKey: ['employees-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-employees-for-assignment');
      
      if (error) throw error;
      return data.employees || [];
    },
  });

  const statusOptions = [
    { value: 'En attente', label: 'En attente' },
    { value: 'Envoyée', label: 'Envoyée' },
    { value: 'Acceptée', label: 'Acceptée' },
    { value: 'Rejetée', label: 'Rejetée' },
  ];

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
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Selection Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-white font-medium">
                {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Status Change */}
            {showStatusSelect ? (
              <div className="relative">
                <Select onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-40 bg-blue-600 border-blue-600 text-white">
                    <SelectValue placeholder="Choisir statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-[60]">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStatusSelect(false)}
                  className="absolute -right-8 top-0 h-full text-gray-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                disabled={isLoading}
                onClick={() => setShowStatusSelect(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Changer statut
              </Button>
            )}

            {/* Assignment */}
            {showAssignSelect ? (
              <div className="relative">
                <Select onValueChange={handleAssignChange}>
                  <SelectTrigger className="w-40 bg-purple-600 border-purple-600 text-white">
                    <SelectValue placeholder="Choisir employé" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-[60]">
                    {employees?.map((employee: any) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAssignSelect(false)}
                  className="absolute -right-8 top-0 h-full text-gray-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                disabled={isLoading}
                onClick={() => setShowAssignSelect(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                Assigner
              </Button>
            )}

            {/* Archive */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleArchive}
              disabled={isLoading}
              className="bg-gray-600 hover:bg-gray-700 text-white border-0"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archiver
            </Button>

            {/* Delete */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-gray-300 hover:text-white hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};