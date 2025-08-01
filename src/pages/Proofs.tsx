import { useState } from 'react';
import { ProofCard } from '@/components/ProofCard';
import { FlexibleDashboardToolbar } from '@/components/FlexibleDashboardToolbar';
import { useFilteredProofs } from '@/hooks/useFilteredProofs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, AlertCircle, Eye, CheckCircle2, CircleDot, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Proofs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  
  const { proofs, isLoading, error } = useFilteredProofs(searchQuery, statusFilter, periodFilter);

  const proofStatusOptions = [
    { value: 'A preparer', label: 'À préparer' },
    { value: 'En préparation', label: 'En préparation' },
    { value: 'Envoyée', label: 'Envoyée' },
    { value: 'En révision', label: 'En révision' },
  ];

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-negative mx-auto mb-4" />
            <h3 className="text-lg font-medium leading-tight mb-2">Erreur de chargement</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              Impossible de charger les épreuves. Veuillez réessayer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statistics = {
    total: proofs?.length || 0,
    toPrepare: proofs?.filter(proof => proof.status === 'A preparer').length || 0,
    inPreparation: proofs?.filter(proof => proof.status === 'En préparation').length || 0,
    sent: proofs?.filter(proof => proof.status === 'Envoyée').length || 0,
    inRevision: proofs?.filter(proof => proof.status === 'En révision').length || 0,
  };

  const navigate = useNavigate();

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
              Épreuves
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
            onClick={() => navigate('/dashboard/create-submission')}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Nouvelle Épreuve</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        </div>

        {/* Toolbar - BaseWeb Search and Filter Pattern */}
        <div className="mb-6">
          <FlexibleDashboardToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Rechercher par numéro de commande ou client..."
            filters={[
              {
                label: "Statut",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "all", label: "Tous les statuts" },
                  ...proofStatusOptions
                ]
              },
              {
                label: "Période",
                value: periodFilter,
                onChange: setPeriodFilter,
                options: [
                  { value: "all", label: "Toute période" },
                  { value: "7days", label: "7 derniers jours" },
                  { value: "30days", label: "30 derniers jours" },
                  { value: "90days", label: "90 derniers jours" }
                ]
              }
            ]}
          />
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
                    {statistics.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* To Prepare Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <CircleDot className="h-5 w-5 text-warning flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    À préparer
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {statistics.toPrepare}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* In Preparation Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <Clock className="h-5 w-5 text-info flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    En cours
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {statistics.inPreparation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sent Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-positive/10 rounded-lg">
                  <Eye className="h-5 w-5 text-positive flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    Envoyées
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {statistics.sent}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* In Revision Card */}
          <Card className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-warning flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight text-muted-foreground font-medium mb-1">
                    En révision
                  </p>
                  <p className="text-[24px] font-semibold leading-tight text-foreground">
                    {statistics.inRevision}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proofs List - BaseWeb Layout Grid */}
        <Card className="bg-background border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px] font-medium text-foreground">Épreuves en attente</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isLoading ? (
              <div className={cn(
                "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
                "gap-2" // 8px grid
              )}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : proofs && proofs.length > 0 ? (
              <div className={cn(
                "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
                "gap-2" // 8px grid spacing
              )}>
                {proofs.map((proof) => (
                  <ProofCard key={proof.id} proof={proof} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <FileText className="h-12 w-12 text-muted-foreground/60 mb-4" />
                  <h3 className="text-[18px] font-medium leading-tight mb-2 text-foreground">
                    Aucune épreuve en attente
                  </h3>
                  <p className="text-[16px] leading-relaxed text-muted-foreground text-center">
                    Les nouvelles épreuves apparaîtront ici dès qu'une commande sera acceptée et qu'une épreuve sera générée.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Proofs;