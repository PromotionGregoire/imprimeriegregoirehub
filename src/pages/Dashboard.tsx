import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="flex h-16 items-center px-4 justify-between">
          <h1 className="text-xl font-semibold">Tableau de Bord</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Bienvenue, {user?.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Gestion des Clients</h2>
          <p className="text-muted-foreground">
            Interface de gestion à venir...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;