import { useState } from 'react';
import { ProofCard } from '@/components/ProofCard';
import { FlexibleDashboardToolbar } from '@/components/FlexibleDashboardToolbar';
import { useFilteredProofs } from '@/hooks/useFilteredProofs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, AlertCircle, Eye, CheckCircle2, CircleDot, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground">
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Épreuves</h1>
        <Button onClick={() => navigate('/dashboard/orders')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Épreuve
        </Button>
      </div>

      {/* Toolbar */}
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-background to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{statistics.total}</p>
                <p className="text-sm text-muted-foreground font-medium">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-[hsl(var(--status-orange-light))]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-[hsl(var(--status-orange))]/10">
                <CircleDot className="h-5 w-5 text-[hsl(var(--status-orange))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(var(--status-orange))]">{statistics.toPrepare}</p>
                <p className="text-sm text-muted-foreground font-medium">À préparer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{statistics.inPreparation}</p>
                <p className="text-sm text-muted-foreground font-medium">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-[hsl(var(--status-purple-light))]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-[hsl(var(--status-purple))]/10">
                <Eye className="h-5 w-5 text-[hsl(var(--status-purple))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(var(--status-purple))]">{statistics.sent}</p>
                <p className="text-sm text-muted-foreground font-medium">Envoyées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-amber-500/10">
                <CheckCircle2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{statistics.inRevision}</p>
                <p className="text-sm text-muted-foreground font-medium">En révision</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proofs List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-primary">Épreuves en attente</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : proofs && proofs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {proofs.map((proof) => (
                <ProofCard key={proof.id} proof={proof} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="p-4 rounded-full bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Aucune épreuve en attente</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Les nouvelles épreuves apparaîtront ici dès qu'une commande sera acceptée et qu'une épreuve sera générée.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Proofs;