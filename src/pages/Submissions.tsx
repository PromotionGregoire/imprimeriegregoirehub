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
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground">
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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Soumissions</h1>
        <Button onClick={() => navigate('/dashboard/submissions/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Soumission
        </Button>
      </div>

      {/* Stats Cards with Period Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[200px]">
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
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Soumissions</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-sm text-purple-600">Complétées</div>
              <div className="text-2xl font-bold text-purple-700">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-sm text-green-600">Acceptées</div>
              <div className="text-2xl font-bold text-green-700">{stats.accepted}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-sm text-orange-600">Envoyées</div>
              <div className="text-2xl font-bold text-orange-700">{stats.sent}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-sm text-blue-600">Valeur Totale</div>
              <div className="text-2xl font-bold text-blue-700">{formatPrice(stats.totalValue)}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Color Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium mb-3">Légende des Couleurs de Cartes:</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-200 rounded"></div>
              <span>Violet - Livrées</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>Vert - Épreuves Acceptées</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 rounded"></div>
              <span>Orange - Échéance ≤ 4 jours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span>Rouge - Échéance ≤ 1 jour</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Défaut - Statut normal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro de soumission ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
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

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {submissions.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
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