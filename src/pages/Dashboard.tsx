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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 md:h-6 md:w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Clients</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            className="gap-2 h-11 md:h-10 px-6 text-base md:text-sm font-medium shadow-sm" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-5 w-5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Nouveau Client</span>
            <span className="sm:hidden">Nouveau</span>
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
        <div className="text-center py-16 md:py-12 px-4">
          <Users className="h-16 w-16 md:h-12 md:w-12 text-muted-foreground mx-auto mb-6 md:mb-4" />
          <h3 className="text-xl md:text-lg font-semibold mb-3 md:mb-2 text-foreground">Aucun client trouvé</h3>
          <p className="text-muted-foreground mb-8 md:mb-6 text-base md:text-sm leading-relaxed max-w-sm mx-auto">
            Cliquez sur "Nouveau Client" pour en ajouter un.
          </p>
          <Button 
            className="gap-2 h-12 md:h-10 px-8 md:px-6 text-base md:text-sm font-medium shadow-sm" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-5 w-5 md:h-4 md:w-4" />
            Nouveau Client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
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