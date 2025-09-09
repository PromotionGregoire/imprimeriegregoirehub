import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/formatters';
import { DashboardStats, SubmissionFilters } from '@/types/submission';

interface DashboardHeaderProps {
  stats: DashboardStats | undefined;
  statsLoading: boolean;
  filters: SubmissionFilters;
  onFiltersChange: (filters: SubmissionFilters) => void;
  onNewSubmission: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  stats,
  statsLoading,
  filters,
  onFiltersChange,
  onNewSubmission,
}) => {
  return (
    <div className="space-y-6">
      {/* Title and Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Soumissions</h1>
          <p className="text-gray-600 mt-1">Gérez vos devis et propositions commerciales</p>
        </div>
        
        <Button onClick={onNewSubmission} className="bg-gray-900 hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Soumission
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatsCard
          title="Total"
          value={stats?.total || 0}
          loading={statsLoading}
        />
        <StatsCard
          title="Complétées"
          value={stats?.completed || 0}
          loading={statsLoading}
        />
        <StatsCard
          title="Acceptées"
          value={stats?.accepted || 0}
          loading={statsLoading}
        />
        <StatsCard
          title="Envoyées"
          value={stats?.sent || 0}
          loading={statsLoading}
        />
        <StatsCard
          title="Valeur totale"
          value={formatCurrency(stats?.totalValue || 0)}
          loading={statsLoading}
          isMonetary
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par numéro, client..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {/* Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}
          >
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="sent">Envoyé</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="accepted">Accepté</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={filters.priority}
            onValueChange={(value) => onFiltersChange({ ...filters, priority: value as any })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="normal">Normale</SelectItem>
              <SelectItem value="low">Basse</SelectItem>
            </SelectContent>
          </Select>

          {/* Assigned Filter */}
          <Select
            value={filters.assigned_to}
            onValueChange={(value) => onFiltersChange({ ...filters, assigned_to: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Assigné à" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
              <SelectItem value="Marie Martin">Marie Martin</SelectItem>
              <SelectItem value="Pierre Durand">Pierre Durand</SelectItem>
              <SelectItem value="">Non assigné</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  loading: boolean;
  isMonetary?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, loading, isMonetary = false }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      {loading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className={`font-bold ${isMonetary ? 'text-xl' : 'text-2xl'} text-gray-900`}>
          {value}
        </p>
      )}
    </div>
  );
};