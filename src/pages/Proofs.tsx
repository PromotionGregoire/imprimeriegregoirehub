import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, CheckCircle } from 'lucide-react';

const Proofs = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Épreuves</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Téléversement d'Épreuves</h3>
            <p className="text-muted-foreground">
              Fonctionnalité à venir pour téléverser les épreuves client.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Gestion des Épreuves</h3>
            <p className="text-muted-foreground">
              Interface de gestion et d'organisation des épreuves.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Validation Client</h3>
            <p className="text-muted-foreground">
              Système de validation et d'approbation par les clients.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard des Épreuves</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section permettra de gérer l'ensemble du processus d'épreuves :
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Téléversement des fichiers d'épreuve</li>
            <li>• Envoi automatique aux clients</li>
            <li>• Suivi des validations et commentaires</li>
            <li>• Gestion des révisions et corrections</li>
            <li>• Historique complet des échanges</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Proofs;