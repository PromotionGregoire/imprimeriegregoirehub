import { useState } from 'react';
import { AdvancedDatePicker } from '@/components/ui/advanced-date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated: () => void;
}

export const CreateEmployeeModal = ({ isOpen, onClose, onEmployeeCreated }: CreateEmployeeModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    job_title: '',
    employment_status: '',
    role: 'EMPLOYEE',
    hire_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call edge function to create user with admin privileges
      // The temporary password will be generated securely by the backend
      const { data, error } = await supabase.functions.invoke('create-employee', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Employé créé avec succès",
        description: `${formData.full_name} a été ajouté. Mot de passe temporaire: ${data.temporary_password}`,
      });

      setFormData({
        full_name: '',
        email: '',
        job_title: '',
        employment_status: '',
        role: 'EMPLOYEE',
        hire_date: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
      });
      
      onEmployeeCreated();
    } catch (error: any) {
      console.error('Error creating employee:', error);
      
      let errorMessage = "Impossible de créer l'employé. Veuillez réessayer.";
      
      // Handle specific error cases
      if (error?.details?.includes('already been registered') || 
          error?.message?.includes('already been registered')) {
        errorMessage = "Cette adresse courriel est déjà utilisée. Veuillez utiliser une adresse différente.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel employé</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Courriel *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Poste</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="Ex: Chargé de projet, Graphiste"
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
                <SelectContent>
                  <SelectItem value="Temps plein">Temps plein</SelectItem>
                  <SelectItem value="Temps partiel">Temps partiel</SelectItem>
                  <SelectItem value="Contractuel">Contractuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employé</SelectItem>
                  <SelectItem value="ACCOUNTANT">Comptable</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hire_date">Date d'embauche</Label>
              <AdvancedDatePicker
                value={formData.hire_date ? new Date(formData.hire_date) : undefined}
                onChange={(date) => handleInputChange('hire_date', date ? date.toISOString().split('T')[0] : '')}
                placeholder="Sélectionner une date d'embauche"
                includeTime={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Contact d'urgence - Nom</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Contact d'urgence - Téléphone</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer l\'employé'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};