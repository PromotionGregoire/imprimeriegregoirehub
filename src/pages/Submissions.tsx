import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, AlertCircle, Search } from 'lucide-react';
import { useFilteredSubmissions } from '@/hooks/useFilteredSubmissions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ModernSubmissionCard from '@/components/ModernSubmissionCard';
import { cn } from '@/lib/utils';

const Submissions = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  
  const { submissions, isLoading, error } = useFilteredSubmissions(searchQuery, statusFilter, periodFilter);

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

  // Calculate dashboard stats
  const stats = {
    total: submissions?.length || 0,
    completed: submissions?.filter(s => s.status === 'Acceptée')?.length || 0,
    accepted: submissions?.filter(s => s.status === 'Acceptée')?.length || 0,
    sent: submissions?.filter(s => s.status === 'Envoyée')?.length || 0,
    totalValue: submissions?.reduce((sum, s) => sum + (Number(s.total_price) || 0), 0) || 0
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
    <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-6">
      {/* Header - BaseWeb Layout Grid */}
      <div className="flex items-center justify-between min-h-[48px]">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-[36px] leading-[1.2] font-semibold text-content-primary">Soumissions</h1>
        </div>
        <Button 
          variant="primary" 
          size="large" 
          className={cn(
            "gap-2 min-h-[48px] px-4 text-[16px] leading-[1.5]",
            "hover:shadow-lg transition-all duration-200",
            "focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          onClick={() => navigate('/dashboard/submissions/new')}
        >
          <Plus className="h-4 w-4" />
          Nouvelle Soumission
        </Button>
      </div>

      {/* Date Range Filter - BaseWeb Pattern */}
      <div className="flex items-center justify-start">
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className={cn(
            "w-[200px] min-h-[48px] text-[16px] leading-[1.5]",
            "focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}>
            <SelectValue placeholder="Filtrer par période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="yesterday">Hier</SelectItem>
            <SelectItem value="thisWeek">Cette semaine</SelectItem>
            <SelectItem value="7days">Les 7 derniers jours</SelectItem>
            <SelectItem value="14days">Les 14 derniers jours</SelectItem>
            <SelectItem value="thisMonth">Ce mois-ci</SelectItem>
            <SelectItem value="30days">Les 30 derniers jours</SelectItem>
            <SelectItem value="3months">Les 3 derniers mois</SelectItem>
            <SelectItem value="6months">Les 6 derniers mois</SelectItem>
            <SelectItem value="thisYear">Cette année</SelectItem>
            <SelectItem value="12months">Les 12 derniers mois</SelectItem>
            <SelectItem value="lastYear">L'année dernière</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards - BaseWeb Card Pattern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <Card className={cn(
          "bg-background-primary border border-border-default",
          "shadow-sm hover:shadow-md transition-shadow duration-200"
        )}>
          <CardContent className="p-4">
            <div className="text-[14px] leading-[1.5] text-content-secondary font-medium mb-2">Total</div>
            <div className="text-[28px] leading-[1.2] font-semibold text-content-primary">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "bg-[hsl(var(--status-purple-light))] border border-[hsl(var(--status-purple))]",
          "shadow-sm hover:shadow-md transition-shadow duration-200"
        )}>
          <CardContent className="p-4">
            <div className="text-[14px] leading-[1.5] text-content-secondary font-medium mb-2">Complétées</div>
            <div className="text-[28px] leading-[1.2] font-semibold text-[hsl(var(--status-purple))]">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "bg-[hsl(var(--status-green-light))] border border-[hsl(var(--status-green))]",
          "shadow-sm hover:shadow-md transition-shadow duration-200"
        )}>
          <CardContent className="p-4">
            <div className="text-[14px] leading-[1.5] text-content-secondary font-medium mb-2">Acceptées</div>
            <div className="text-[28px] leading-[1.2] font-semibold text-[hsl(var(--status-green))]">{stats.accepted}</div>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "bg-[hsl(var(--status-orange-light))] border border-[hsl(var(--status-orange))]",
          "shadow-sm hover:shadow-md transition-shadow duration-200"
        )}>
          <CardContent className="p-4">
            <div className="text-[14px] leading-[1.5] text-content-secondary font-medium mb-2">Envoyées</div>
            <div className="text-[28px] leading-[1.2] font-semibold text-[hsl(var(--status-orange))]">{stats.sent}</div>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "bg-[hsl(var(--status-blue-light))] border border-[hsl(var(--status-blue))]",
          "shadow-sm hover:shadow-md transition-shadow duration-200"
        )}>
          <CardContent className="p-4">
            <div className="text-[14px] leading-[1.5] text-content-secondary font-medium mb-2">Valeur Totale</div>
            <div className="text-[28px] leading-[1.2] font-semibold text-[hsl(var(--status-blue))]">{formatPrice(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Status Filter Bar - BaseWeb Pattern */}
      <Card className={cn(
        "border border-border-default shadow-sm",
        "hover:shadow-md transition-shadow duration-200"
      )}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-content-secondary" />
              <Input
                placeholder="Rechercher par numéro de soumission ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10 min-h-[48px] text-[16px] leading-[1.5]",
                  "focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={cn(
                "w-full sm:w-[200px] min-h-[48px] text-[16px] leading-[1.5]",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {submissionStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Grid - BaseWeb Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {submissions.length === 0 ? (
          <div className="col-span-full">
            <Card className={cn(
              "border border-border-default shadow-sm",
              "hover:shadow-md transition-shadow duration-200"
            )}>
              <CardContent className="text-center py-16">
                <FileText className="mx-auto h-12 w-12 text-content-secondary mb-4" />
                <h3 className="text-[24px] leading-[1.2] font-semibold mb-2 text-content-primary">Aucune soumission trouvée</h3>
                <p className="text-[16px] leading-[1.5] text-content-secondary max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Aucune soumission trouvée avec ces critères'
                    : 'Aucune soumission pour le moment'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          submissions.map((submission) => (
            <ModernSubmissionCard
              key={submission.id}
              submission={submission}
              onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Submissions;