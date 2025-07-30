import { useAuth } from '@/hooks/useAuth';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import ClientCard from '@/components/ClientCard';
import { Plus, Users } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: clients, isLoading, error } = useClients();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border">
          <div className="flex h-16 items-center px-6 justify-between">
            <h1 className="text-xl font-semibold">Clients</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Chargement des clients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border">
          <div className="flex h-16 items-center px-6 justify-between">
            <h1 className="text-xl font-semibold">Clients</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center">
            <p className="text-destructive">Erreur lors du chargement des clients</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="flex h-16 items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Clients</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Client
            </Button>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        {!clients || clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun client trouvé</h3>
            <p className="text-muted-foreground mb-6">
              Cliquez sur "Nouveau Client" pour en ajouter un.
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Client
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                business_name={client.business_name}
                contact_name={client.contact_name}
                email={client.email}
                phone_number={client.phone_number}
                client_number={client.client_number}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;