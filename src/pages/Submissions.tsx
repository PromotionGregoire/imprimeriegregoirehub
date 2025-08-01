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


        {/* Statistics Cards - BaseWeb Card Pattern with 8px Grid */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
          "gap-2 mb-6" // 8px gaps
        )}>
          {/* Total Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Total
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-positive/10 rounded-lg">
                  <FileText className="h-5 w-5 text-positive flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Complétées
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accepted Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <FileText className="h-5 w-5 text-info flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Acceptées
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.accepted}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sent Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <FileText className="h-5 w-5 text-warning flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Envoyées
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {stats.sent}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Value Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="h-5 w-5 text-accent flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Valeur Totale
                  </p>
                  <p className="text-[20px] font-semibold leading-tight text-foreground truncate">
                    {formatPrice(stats.totalValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar - BaseWeb Search and Filter Pattern */}
        <div className="mb-6">
          <Card className="bg-background border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro de soumission ou client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background border border-border shadow-lg">
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background border border-border shadow-lg">
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
        </div>

        {/* Submissions Grid - BaseWeb Layout Grid */}
        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4",
          "gap-2" // 8px grid spacing
        )}>
          {submissions.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-background border-border">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center max-w-md mx-auto">
                    <FileText className="h-12 w-12 text-muted-foreground/60 mb-4" />
                    <h3 className="text-[18px] font-medium leading-tight mb-2 text-foreground">
                      Aucune soumission trouvée
                    </h3>
                    <p className="text-[16px] leading-relaxed text-muted-foreground text-center">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Aucune soumission trouvée avec ces critères'
                        : 'Aucune soumission pour le moment'
                      }
                    </p>
                  </div>
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
    </div>
  );
};

export default Submissions;