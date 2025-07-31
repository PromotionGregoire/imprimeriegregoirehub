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
  const { data: employees, isLoading, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
    enabled: currentUserProfile?.role === 'ADMIN',
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

      {isLoading ? (
        <div className="text-center py-8">Chargement des employés...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}

      {filteredEmployees.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun employé trouvé.
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