import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSupplierMutations } from '@/hooks/useSupplierMutations';

interface CreateSupplierModalProps {
  trigger?: React.ReactNode;
}

const CreateSupplierModal = ({ trigger }: CreateSupplierModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    is_goods_supplier: false,
    is_service_supplier: false,
    contact_person: '',
    email: '',
    phone: '',
    website_1: '',
    website_2: '',
    notes: '',
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { createSupplier } = useSupplierMutations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || (!formData.is_goods_supplier && !formData.is_service_supplier)) {
      return;
    }

    createSupplier.mutate(formData, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({
          name: '',
          is_goods_supplier: false,
          is_service_supplier: false,
          contact_person: '',
          email: '',
          phone: '',
          website_1: '',
          website_2: '',
          notes: '',
        });
        setSelectedCategories([]);
      },
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const availableCategories = ['Vêtement', 'Imprimerie', 'Objet promotionnel', 'Packaging', 'Accessoires', 'Électronique'];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Fournisseur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau fournisseur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du fournisseur *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: S&S Activewear"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Type de fournisseur *</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_goods_supplier"
                  checked={formData.is_goods_supplier}
                  onChange={(e) => handleChange('is_goods_supplier', e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="is_goods_supplier">Fournisseur de biens</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_service_supplier"
                  checked={formData.is_service_supplier}
                  onChange={(e) => handleChange('is_service_supplier', e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="is_service_supplier">Fournisseur de services</Label>
              </div>
            </div>
          </div>

          {/* Spécialités conditionnelles */}
          {formData.is_goods_supplier && (
            <div className="space-y-2">
              <Label>Spécialités (catégories de produits)</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="rounded border-input"
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">{category}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="contact_person">Personne de contact</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => handleChange('contact_person', e.target.value)}
              placeholder="Nom du contact principal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contact@fournisseur.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_1">Site web 1</Label>
            <Input
              id="website_1"
              value={formData.website_1}
              onChange={(e) => handleChange('website_1', e.target.value)}
              placeholder="https://www.fournisseur.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_2">Site web 2</Label>
            <Input
              id="website_2"
              value={formData.website_2}
              onChange={(e) => handleChange('website_2', e.target.value)}
              placeholder="https://www.catalogue.fournisseur.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Notes supplémentaires..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createSupplier.isPending}>
              {createSupplier.isPending ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupplierModal;