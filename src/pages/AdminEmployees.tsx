import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

import { FlexibleDashboardToolbar } from '@/components/FlexibleDashboardToolbar';
import { Button } from '@/components/ui/button';
import { Plus, Users, Trash2 } from 'lucide-react';
import { EmployeeCard } from '@/components/EmployeeCard';
import { CreateEmployeeModal } from '@/components/CreateEmployeeModal';
import { EditEmployeeModal } from '@/components/EditEmployeeModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const AdminEmployees = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);

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
    const matchesRole = !roleFilter || roleFilter === 'all' || employee.role === roleFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || employee.employment_status === statusFilter;
    
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

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleEmployeeUpdated = () => {
    refetch();
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = (employee: any) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      // First delete the profile from the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', employeeToDelete.id);

      if (profileError) throw profileError;

      // Then delete the auth user (this requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(employeeToDelete.id);
      
      if (authError) {
        console.warn('Could not delete auth user (this may require admin privileges):', authError);
        // Don't throw here since the profile was already deleted
      }

      refetch();
      toast({
        title: "Employé supprimé",
        description: "L'employé a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'employé.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleResetPassword = async (employee: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ password_reset_required: true })
        .eq('id', employee.id);

      if (error) throw error;

      refetch();
      toast({
        title: "Mot de passe réinitialisé",
        description: "L'employé devra changer son mot de passe à la prochaine connexion.",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le mot de passe.",
        variant: "destructive",
      });
    }
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
              { value: "all", label: "Tous les rôles" },
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
              { value: "all", label: "Tous les statuts" },
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
            <EmployeeCard 
              key={employee.id} 
              employee={employee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
              onResetPassword={handleResetPassword}
            />
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

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={selectedEmployee}
        onEmployeeUpdated={handleEmployeeUpdated}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'employé{' '}
              <strong>{employeeToDelete?.full_name}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEmployees;