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
      <div className="p-base-600 pb-24 md:pb-base-600">
        <div className="text-center py-base-1000">
          <div className="animate-uber-pulse">
            <Users className="h-base-800 w-base-800 text-muted-foreground mx-auto mb-base-400" />
          </div>
          <p className="text-base-300 text-muted-foreground">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-base-600 pb-24 md:pb-base-600">
        <div className="text-center py-base-1000">
          <Users className="h-base-800 w-base-800 text-negative mx-auto mb-base-400" />
          <h3 className="text-base-550 font-semibold text-foreground mb-base-200">Erreur de chargement</h3>
          <p className="text-base-300 text-negative mb-base-600">Erreur lors du chargement des clients</p>
          <Button 
            variant="secondary" 
            onClick={() => window.location.reload()}
            className="transition-all ease-uber"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-base-600 space-y-base-600 pb-24 md:pb-base-600">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-base-300">
          <Users className="h-base-600 w-base-600 text-primary" />
          <h1 className="text-base-750 font-semibold">Clients</h1>
        </div>
        <div className="flex items-center gap-base-400">
          <Button 
            variant="primary" 
            size="default" 
            className="gap-base-200 transition-all ease-uber" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-base-400 w-base-400" />
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
        <div className="text-center py-base-1000 md:py-base-800">
          <Users className="h-base-800 w-base-800 md:h-base-600 md:w-base-600 text-muted-foreground mx-auto mb-base-600 md:mb-base-400" />
          <h3 className="text-base-550 md:text-base-400 font-semibold mb-base-300 md:mb-base-200 text-foreground">Aucun client trouvé</h3>
          <p className="text-muted-foreground mb-base-600 md:mb-base-600 text-base-300 md:text-base-200 leading-relaxed max-w-sm mx-auto">
            Cliquez sur "Nouveau Client" pour en ajouter un.
          </p>
          <Button 
            variant="primary" 
            size="default" 
            className="gap-base-200 transition-all ease-uber" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-base-400 w-base-400" />
            Nouveau Client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 animate-fade-in">
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