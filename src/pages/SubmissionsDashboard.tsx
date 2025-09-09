import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SubmissionCard } from '@/components/SubmissionCard';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useSubmissionsData, useDashboardStats, useBulkActions } from '@/hooks/useSubmissionsData';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { SubmissionFilters } from '@/types/submission';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SUBMISSION_STATUS } from '@/constants/status-constants';

export const SubmissionsDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Filters state
  const [filters, setFilters] = useState<SubmissionFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    assigned_to: 'all',
  });

  // Data fetching
  const { data: submissions = [], isLoading, error } = useSubmissionsData(filters);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  // Multi-selection
  const {
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection,
    selectedCount,
    selected: selectedIds,
    isAllSelected,
  } = useMultiSelect(submissions);

  const [statusTargetId, setStatusTargetId] = useState<string | null>(null);
  const targetSubmission = useMemo(() => submissions.find(s => s.id === statusTargetId) || null, [submissions, statusTargetId]);
  const statusOptions = useMemo(() => (
    Object.values(SUBMISSION_STATUS)
  ), []);
  const { updateStatus } = useBulkActions();

  const handleMenuAction = (action: string, submissionId: string) => {
    switch (action) {
      case 'view':
        navigate(`/dashboard/submissions/${submissionId}`);
        break;
      case 'proof':
        navigate(`/dashboard/submissions/${submissionId}/proof`);
        break;
      case 'status':
        setStatusTargetId(submissionId);
        break;
      case 'archive':
        console.log('Archive:', submissionId);
        break;
      case 'delete':
        console.log('Delete:', submissionId);
        break;
    }
  };
  const handleNewSubmission = () => {
    navigate('/dashboard/submissions/new');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600">Impossible de charger les soumissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container with responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <DashboardHeader
          stats={stats}
          statsLoading={statsLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onNewSubmission={handleNewSubmission}
        />

        {/* Content */}
        <div className="mt-8">
          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="h-1 bg-gray-200" />
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                      </div>
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : submissions.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune soumission trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                  ? 'Aucune soumission ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre première soumission.'}
              </p>
              <button
                onClick={handleNewSubmission}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Créer une soumission
              </button>
            </div>
          ) : (
            <>
              {/* Selection header */}
              {submissions.length > 0 && (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={isAllSelected ? clearSelection : selectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Sélectionner tout ({submissions.length})
                      </span>
                    </label>
                  </div>
                  
                  {hasSelection && (
                    <span className="text-sm text-blue-600 font-medium">
                      {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              {/* Submissions Grid - RESPONSIVE STRICTE */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                {submissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    isSelected={isSelected(submission.id)}
                    onSelect={toggleSelection}
                    onMenuAction={handleMenuAction}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom padding for bulk actions bar */}
        {hasSelection && <div className="h-16" />}
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        selectedIds={selectedIds}
        onClearSelection={clearSelection}
      />

      {/* Status Change Dialog */}
      <Dialog open={!!statusTargetId} onOpenChange={(open) => !open && setStatusTargetId(null)}>
        <DialogContent className="max-w-sm z-[60]">
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {statusOptions.map((s) => (
              <Button
                key={s}
                variant={Object.values(SUBMISSION_STATUS).includes(targetSubmission?.status as any) ? 'secondary' : 'outline'}
                className="w-full justify-start"
                onClick={() => {
                  if (!statusTargetId) return;
                  updateStatus({ ids: [statusTargetId], status: s });
                  setStatusTargetId(null);
                }}
              >
                {s}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionsDashboard;