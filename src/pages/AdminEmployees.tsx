import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

import { FlexibleDashboardToolbar } from '@/components/FlexibleDashboardToolbar';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { EmployeeCard } from '@/components/EmployeeCard';
import { CreateEmployeeModal } from '@/components/CreateEmployeeModal';
import { useToast } from '@/hooks/use-toast';

const AdminEmployees = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Check if current user is admin
  const { data: currentUserProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch all employees
  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      return data;
    },
    enabled: currentUserProfile?.role === 'ADMIN',
    retry: 1,
  });

  if (profileLoading) {
    return <div>Chargement...</div>;
  }

  if (!user || currentUserProfile?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = employee.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || employee.role === roleFilter;
    const matchesStatus = !statusFilter || employee.employment_status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const handleEmployeeCreated = () => {
    refetch();
    setIsCreateModalOpen(false);
    toast({
      title: "Employé créé",
      description: "Le nouvel employé a été créé avec succès.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Gestion des Employés</h1>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un employé
        </Button>
      </div>

      <FlexibleDashboardToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par nom, courriel, poste..."
        filters={[
          {
            label: "Rôle",
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: "", label: "Tous les rôles" },
              { value: "EMPLOYEE", label: "Employé" },
              { value: "ACCOUNTANT", label: "Comptable" },
              { value: "ADMIN", label: "Admin" },
            ]
          },
          {
            label: "Statut d'emploi",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "", label: "Tous les statuts" },
              { value: "Temps plein", label: "Temps plein" },
              { value: "Temps partiel", label: "Temps partiel" },
              { value: "Contractuel", label: "Contractuel" },
            ]
          }
        ]}
      />

      {/* État de chargement */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Chargement des employés...</p>
        </div>
      )}

      {/* État d'erreur */}
      {error && (
        <div className="text-center py-12 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="text-destructive text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-destructive mb-2">
            Impossible de charger la liste des employés
          </h3>
          <p className="text-muted-foreground mb-4">
            Un problème de permissions est suspecté. Les administrateurs doivent pouvoir accéder à toutes les données des employés.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Erreur technique: {error?.message || 'Erreur inconnue'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Réessayer
          </Button>
        </div>
      )}

      {/* Liste des employés - seulement si pas d'erreur et pas en chargement */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}

      {/* Message si aucun employé trouvé */}
      {!isLoading && !error && filteredEmployees.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun employé trouvé</h3>
          <p className="text-muted-foreground">
            {searchQuery || roleFilter || statusFilter 
              ? 'Aucun employé ne correspond aux critères de recherche.' 
              : 'Aucun employé dans le système.'}
          </p>
        </div>
      )}

      <CreateEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEmployeeCreated={handleEmployeeCreated}
      />
    </div>
  );
};

export default AdminEmployees;