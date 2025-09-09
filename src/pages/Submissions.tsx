import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  FileText, 
  AlertCircle, 
  Search, 
  Check,
  Send,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useAllSubmissions } from '@/hooks/useAllSubmissions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GravitySubmissionCard from '@/components/GravitySubmissionCard';
import { ArchiveFilter } from '@/components/ArchiveFilter';
import { ArchiveActions } from '@/components/ArchiveActions';
import { ArchiveFilter as ArchiveFilterType } from '@/utils/archiveUtils';
import { cn } from '@/lib/utils';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { BulkActionsBar } from '@/components/BulkActionsBar';

const Submissions = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilterType>('actives');
  
  const { data: submissions, isLoading, error } = useAllSubmissions(archiveFilter);

  // Filter submissions based on search and status
  const filteredSubmissions = submissions?.filter(submission => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesNumber = submission?.submission_number?.toLowerCase().includes(searchLower);
      const matchesClient = submission?.clients?.business_name?.toLowerCase().includes(searchLower);
      if (!matchesNumber && !matchesClient) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && submission?.status !== statusFilter) {
      return false;
    }

    // Period filter (simplified for now)
    // TODO: Implement proper period filtering

    return true;
  }) || [];

  // Use multi-select hook for bulk actions
  const {
    selected,
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection,
    selectedCount,
    isAllSelected
  } = useMultiSelect(filteredSubmissions || []);

  const submissionStatusOptions = [
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Envoyée', label: 'Envoyée' },
    { value: 'Acceptée', label: 'Acceptée' },
    { value: 'Refusée', label: 'Refusée' },
    { value: 'Livrée', label: 'Livrée' },
  ];

  if (error) {
    return (
      <div className="px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-negative mx-auto mb-4" />
            <h3 className="text-[24px] leading-[1.2] font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-[16px] leading-[1.5] text-content-secondary">
              Impossible de charger les soumissions. Veuillez réessayer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate dashboard stats with trends
  const stats = {
    total: filteredSubmissions?.length || 0,
    completed: filteredSubmissions?.filter(s => s?.status === 'Acceptée')?.length || 0,
    accepted: filteredSubmissions?.filter(s => s?.status === 'Acceptée')?.length || 0,
    sent: filteredSubmissions?.filter(s => s?.status === 'Envoyée')?.length || 0,
    totalValue: filteredSubmissions?.reduce((sum, s) => sum + (Number(s?.total_price) || 0), 0) || 0,
    trend: '+12.5%' // Mock trend data - can be calculated from historical data
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  const getCardStyle = (submission: any) => {
    const deadline = submission.deadline ? new Date(submission.deadline) : null;
    const today = new Date();
    const daysLeft = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    switch (submission.status) {
      case 'Livrée':
        return 'bg-purple-50 border-purple-200';
      case 'Acceptée':
        return 'bg-green-50 border-green-200';
      case 'Envoyée':
        if (daysLeft !== null && daysLeft <= 1) {
          return 'bg-red-50 border-red-200';
        } else if (daysLeft !== null && daysLeft <= 4) {
          return 'bg-orange-50 border-orange-200';
        }
        return 'bg-white border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getDeadlineText = (submission: any) => {
    const deadline = submission.deadline ? new Date(submission.deadline) : null;
    const today = new Date();
    const daysLeft = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    if (!deadline) return 'Non définie';
    if (daysLeft === 1) return `${formatDate(submission.deadline)} (1 jour restant)`;
    if (daysLeft && daysLeft > 1) return `${formatDate(submission.deadline)} (${daysLeft} jours restants)`;
    return formatDate(submission.deadline);
  };
  
  if (isLoading) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* BaseWeb Layout Container with responsive margins */}
      <div className={cn(
        "mx-auto max-w-7xl",
        "px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8",
        "pb-20 md:pb-8" // Bottom nav spacing
      )}>
        
        {/* Header Section - BaseWeb Typography Scale */}
        <div className={cn(
          "flex flex-col sm:flex-row items-start sm:items-center justify-between",
          "gap-4 mb-6"
        )}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="h-6 w-6 text-primary flex-shrink-0" />
            <h1 className={cn(
              "text-[36px] font-semibold leading-tight text-foreground",
              "truncate" // Prevent overflow
            )}>
              Soumissions
            </h1>
          </div>
          {/* BaseWeb Button with 48px touch target */}
          <Button 
            variant="primary"
            size="default"
            className={cn(
              "min-h-[48px] px-4 gap-2",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "transition-all duration-200 ease-out",
              "shadow-sm hover:shadow-md",
              "whitespace-nowrap"
            )}
            onClick={() => navigate('/dashboard/submissions/new')}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Nouvelle Soumission</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        </div>


        {/* Modern Statistics Cards - Horizontal Layout */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Card with Trend */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total</span>
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {stats.trend}
              </p>
            </div>
            
            {/* Completed Card */}
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700">Complétées</span>
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>

            {/* Accepted Card */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-700">Acceptées</span>
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.accepted}</p>
            </div>

            {/* Sent Card */}
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-orange-700">Envoyées</span>
                <Send className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-900">{stats.sent}</p>
            </div>

            {/* Total Value Card */}
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-700">Valeur Totale</span>
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {formatPrice(stats.totalValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par numéro ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tous
              </button>
              <button 
                onClick={() => setStatusFilter('Acceptée')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'Acceptée' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Acceptées
              </button>
              <button 
                onClick={() => setStatusFilter('Envoyée')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'Envoyée' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                En attente
              </button>
            </div>

            {/* Advanced Filter Dropdown */}
            <div className="hidden lg:block">
              <ArchiveFilter 
                value={archiveFilter} 
                onChange={setArchiveFilter}
                className="w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Legend - Color Codes */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">🎨 Codes de couleurs</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-green-500 rounded"></div>
                <span className="text-gray-600">Acceptée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Envoyée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-orange-500 rounded"></div>
                <span className="text-gray-600">En attente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500 rounded"></div>
                <span className="text-gray-600">Refusée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-gray-500 rounded"></div>
                <span className="text-gray-600">Brouillon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Submissions Grid - 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubmissions.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-background border-border">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center max-w-md mx-auto">
                    <FileText className="h-12 w-12 text-muted-foreground/60 mb-4" />
                    <h3 className="text-[18px] font-medium leading-tight mb-2 text-foreground">
                      Aucune soumission trouvée
                    </h3>
                    <p className="text-[16px] leading-relaxed text-muted-foreground text-center">
                      {searchQuery || statusFilter !== 'all' || archiveFilter !== 'actives'
                        ? 'Aucune soumission trouvée avec ces critères'
                        : 'Aucune soumission pour le moment'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission.id} className="relative">
                <GravitySubmissionCard
                  submission={submission}
                  onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                  isSelected={isSelected(submission.id)}
                  onSelect={(e) => {
                    e?.stopPropagation();
                    toggleSelection(submission.id);
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        selectedIds={selected}
        onClearSelection={clearSelection}
      />
    </div>
  );
};

export default Submissions;