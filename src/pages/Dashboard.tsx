import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ClientCard from '@/components/ClientCard';
import CreateClientModal from '@/components/CreateClientModal';
import { ClientActivityToolbar } from '@/components/ClientActivityToolbar';
import { useFilteredClientsByActivity } from '@/hooks/useFilteredClientsByActivity';
import { Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[36px] font-semibold leading-tight">Clients</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto">
            <Users className="h-12 w-12 text-negative mx-auto mb-4" />
            <h3 className="text-lg font-medium leading-tight mb-2">Erreur de chargement</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              Erreur lors du chargement des clients
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            <Users className="h-6 w-6 text-primary flex-shrink-0" />
            <h1 className={cn(
              "text-[36px] font-semibold leading-tight text-foreground",
              "truncate" // Prevent overflow
            )}>
              Clients
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
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Nouveau Client</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
        
        {/* Toolbar - BaseWeb Search and Filter Pattern */}
        <div className="mb-6">
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
        </div>

        {/* Main Content - BaseWeb Layout Grid with Responsive Breakpoints */}
        {!clients || clients.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <Users className="h-12 w-12 text-muted-foreground/60 mb-4" />
              <h3 className="text-[18px] font-medium leading-tight mb-2 text-foreground">
                Aucun client trouvé
              </h3>
              <p className="text-[16px] leading-relaxed text-muted-foreground text-center mb-6">
                Cliquez sur "Nouveau Client" pour en ajouter un.
              </p>
              <Button 
                variant="primary"
                size="default"
                className={cn(
                  "min-h-[48px] px-4 gap-2",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "transition-all duration-200 ease-out",
                  "shadow-sm hover:shadow-md"
                )}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                Nouveau Client
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            "gap-2", // 8px grid spacing
            "animate-fade-in"
          )}>
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
    </div>
  );
};

export default Dashboard;