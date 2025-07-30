import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployeeAssignManagerProps {
  clientId?: string;
  submissionId?: string;
  currentAssignedUserId?: string;
  type: 'client' | 'submission';
}

const EmployeeAssignManager = ({ 
  clientId, 
  submissionId, 
  currentAssignedUserId, 
  type 
}: EmployeeAssignManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentAssignedUserId || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all employees
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Get current assigned user
  const { data: currentUser } = useQuery({
    queryKey: ['assigned-user', currentAssignedUserId],
    queryFn: async () => {
      if (!currentAssignedUserId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', currentAssignedUserId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentAssignedUserId,
  });

  // Assign user mutation
  const assignUser = useMutation({
    mutationFn: async ({ userId }: { userId: string | null }) => {
      if (type === 'client' && clientId) {
        const { error } = await supabase
          .from('clients')
          .update({ assigned_user_id: userId })
          .eq('id', clientId);
        
        if (error) throw error;
      }
      // Note: For submissions, you'd need to add an assigned_user_id column to the submissions table
      // For now, we'll focus on client assignment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-details', clientId] });
      queryClient.invalidateQueries({ queryKey: ['assigned-user', selectedUserId] });
      
      toast({
        title: 'Succès',
        description: 'Employé assigné avec succès',
      });
      setIsOpen(false);
    },
    onError: (error) => {
      console.error('Error assigning user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'assigner l\'employé',
        variant: 'destructive',
      });
    },
  });

  const handleAssign = () => {
    assignUser.mutate({ userId: selectedUserId || null });
  };

  const handleUnassign = () => {
    assignUser.mutate({ userId: null });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {currentUser ? (
            <>
              <User className="w-4 h-4" />
              {currentUser.full_name}
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Assigner un employé
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'client' ? 'Assigner un employé au client' : 'Assigner un employé à la soumission'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sélectionner un employé</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un employé..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun employé assigné</SelectItem>
                {employees?.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAssign} 
              disabled={assignUser.isPending}
              className="flex-1"
            >
              {assignUser.isPending ? 'Attribution...' : 'Assigner'}
            </Button>
            
            {currentAssignedUserId && (
              <Button 
                variant="outline" 
                onClick={handleUnassign}
                disabled={assignUser.isPending}
              >
                Désassigner
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAssignManager;