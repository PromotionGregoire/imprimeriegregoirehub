import { ProofCard } from '@/components/ProofCard';
import { useProofs } from '@/hooks/useProofs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, AlertCircle } from 'lucide-react';

const Proofs = () => {
  const { data: proofs, isLoading, error } = useProofs();

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
    toPrepare: proofs?.filter(proof => proof.status === 'À préparer').length || 0,
    inPreparation: proofs?.filter(proof => proof.status === 'En préparation').length || 0,
    sent: proofs?.filter(proof => proof.status === 'Envoyée').length || 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Épreuves</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{statistics.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.toPrepare}</p>
                <p className="text-sm text-muted-foreground">À préparer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-blue-600"></div>
              <div>
                <p className="text-2xl font-bold">{statistics.inPreparation}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-purple-600"></div>
              <div>
                <p className="text-2xl font-bold">{statistics.sent}</p>
                <p className="text-sm text-muted-foreground">Envoyées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proofs List */}
      <Card>
        <CardHeader>
          <CardTitle>Épreuves en attente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] w-full" />
              ))}
            </div>
          ) : proofs && proofs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proofs.map((proof) => (
                <ProofCard key={proof.id} proof={proof} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune épreuve en attente</h3>
              <p className="text-muted-foreground">
                Les nouvelles épreuves apparaîtront ici dès qu'une commande sera acceptée.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Proofs;