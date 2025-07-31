import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ClientCard from '@/components/ClientCard';
import CreateClientModal from '@/components/CreateClientModal';
import { ClientActivityToolbar } from '@/components/ClientActivityToolbar';
import { useFilteredClientsByActivity } from '@/hooks/useFilteredClientsByActivity';

import { Plus, Users } from 'lucide-react';

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  
  const { clients, isLoading, error } = useFilteredClientsByActivity(searchQuery, statusFilter, activityFilter);

  const clientStatusOptions = [
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Actif', label: 'Actif' },
    { value: 'Inactif', label: 'Inactif' },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-destructive">Erreur lors du chargement des clients</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Clients</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouveau Client
          </Button>
        </div>
      </div>
      
      {/* Toolbar */}
      <ClientActivityToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        activityFilter={activityFilter}
        onActivityChange={setActivityFilter}
        statusOptions={clientStatusOptions}
        searchPlaceholder="Rechercher par nom d'entreprise, contact ou email..."
      />

      {/* Main Content */}
      {!clients || clients.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun client trouvé</h3>
          <p className="text-muted-foreground mb-6">
            Cliquez sur "Nouveau Client" pour en ajouter un.
          </p>
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouveau Client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              id={client.id}
              business_name={client.business_name}
              contact_name={client.contact_name}
              email={client.email}
              phone_number={client.phone_number}
              client_number={client.client_number}
              main_contact_position={client.main_contact_position}
              client_type={client.client_type}
              industry={client.industry}
              status={client.status}
              billing_city={client.billing_city}
              billing_province={client.billing_province}
            />
          ))}
        </div>
      )}

      <CreateClientModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;