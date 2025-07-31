import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  full_name: string;
  role: string;
  job_title?: string;
  employment_status?: string;
  hire_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  password_reset_required?: boolean;
  email?: string;
}

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEmployeeUpdated: () => void;
}

export const EditEmployeeModal = ({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdated,
}: EditEmployeeModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    job_title: '',
    employment_status: '',
    hire_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    email: '',
  });

  // Update form when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || '',
        role: employee.role || '',
        job_title: employee.job_title || '',
        employment_status: employee.employment_status || '',
        hire_date: employee.hire_date || '',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        email: employee.email || '',
      });
    }
  }, [employee]);

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!employee) throw new Error('No employee selected');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          role: data.role,
          job_title: data.job_title,
          employment_status: data.employment_status,
          hire_date: data.hire_date || null,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
          email: data.email || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', employee.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onEmployeeUpdated();
      onClose();
      toast({
        title: "Employé mis à jour",
        description: "Les informations de l'employé ont été mises à jour avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error updating employee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'employé.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom complet est requis.",
        variant: "destructive",
      });
      return;
    }

    updateEmployeeMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'employé</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Nom complet de l'employé"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Courriel</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="courriel@exemple.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="EMPLOYEE">Employé</SelectItem>
                <SelectItem value="ACCOUNTANT">Comptable</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Titre du poste</Label>
            <Input
              id="job_title"
              value={formData.job_title}
              onChange={(e) => handleInputChange('job_title', e.target.value)}
              placeholder="Ex: Graphiste, Comptable, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment_status">Statut d'emploi</Label>
            <Select 
              value={formData.employment_status} 
              onValueChange={(value) => handleInputChange('employment_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="Temps plein">Temps plein</SelectItem>
                <SelectItem value="Temps partiel">Temps partiel</SelectItem>
                <SelectItem value="Contractuel">Contractuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hire_date">Date d'embauche</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => handleInputChange('hire_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Contact d'urgence - Nom</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
              placeholder="Nom du contact d'urgence"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact d'urgence - Téléphone</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
              placeholder="Numéro de téléphone"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateEmployeeMutation.isPending}>
              {updateEmployeeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};