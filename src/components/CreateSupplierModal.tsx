import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSupplierMutations } from '@/hooks/useSupplierMutations';
import { useSupplierSpecialtyMutations, useSupplierSpecialties } from '@/hooks/useSupplierSpecialties';

interface CreateSupplierModalProps {
  trigger?: React.ReactNode;
  supplier?: any; // For editing mode
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateSupplierModal = ({ trigger, supplier, isOpen: controlledOpen, onOpenChange }: CreateSupplierModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
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
  const [selectedGoodsCategories, setSelectedGoodsCategories] = useState<string[]>([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);

  const { createSupplier, updateSupplier } = useSupplierMutations();
  const { updateSupplierSpecialties } = useSupplierSpecialtyMutations();
  const { data: existingSpecialties } = useSupplierSpecialties(supplier?.id);
  
  // Initialiser les données si on édite
  React.useEffect(() => {
    if (supplier && isOpen) {
      setFormData({
        name: supplier.name || '',
        is_goods_supplier: supplier.is_goods_supplier || false,
        is_service_supplier: supplier.is_service_supplier || false,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        website_1: supplier.website_1 || '',
        website_2: supplier.website_2 || '',
        notes: supplier.notes || '',
      });
      
      // Load existing specialties
      if (existingSpecialties) {
        const goods = existingSpecialties
          .filter(s => s.category_type === 'Bien')
          .map(s => s.category_name);
        const services = existingSpecialties
          .filter(s => s.category_type === 'Service')
          .map(s => s.category_name);
        
        setSelectedGoodsCategories(goods);
        setSelectedServiceCategories(services);
      }
    } else if (!supplier && isOpen) {
      // Reset for new supplier
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
      setSelectedGoodsCategories([]);
      setSelectedServiceCategories([]);
    }
  }, [supplier, isOpen, existingSpecialties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || (!formData.is_goods_supplier && !formData.is_service_supplier)) {
      return;
    }

    try {
      if (supplier) {
        // Update supplier
        await updateSupplier.mutateAsync({ id: supplier.id, ...formData });
        
        // Update specialties
        await updateSupplierSpecialties.mutateAsync({
          supplierId: supplier.id,
          goodsCategories: selectedGoodsCategories,
          serviceCategories: selectedServiceCategories,
        });
      } else {
        // Create supplier
        const newSupplier = await createSupplier.mutateAsync(formData);
        
        // Add specialties if any
        if (selectedGoodsCategories.length > 0 || selectedServiceCategories.length > 0) {
          await updateSupplierSpecialties.mutateAsync({
            supplierId: newSupplier.id,
            goodsCategories: selectedGoodsCategories,
            serviceCategories: selectedServiceCategories,
          });
        }
      }

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
      setSelectedGoodsCategories([]);
      setSelectedServiceCategories([]);
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const availableGoodsCategories = [
    'Vêtement & Textile',
    'Objet promotionnel', 
    'Imprimerie & Papier',
    'Packaging & Emballage',
    'Électronique',
    'Signalisation & Affichage (Bannières, Coroplast)',
    'Accessoires (Sacs, Casquettes, etc.)'
  ];

  const availableServiceCategories = [
    'Sérigraphie',
    'Broderie', 
    'Gravure Laser',
    'Impression Numérique (Grand Format)',
    'Impression Offset',
    'Découpe Vinyle',
    'Finition & Reliure',
    'Conception Graphique',
    'Installation & Pose'
  ];

  const toggleGoodsCategory = (category: string) => {
    setSelectedGoodsCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleServiceCategory = (category: string) => {
    setSelectedServiceCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Modifier le fournisseur' : 'Créer un nouveau fournisseur'}
          </DialogTitle>
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

          {/* Spécialités conditionnelles pour les biens */}
          {formData.is_goods_supplier && (
            <div className="space-y-2">
              <Label>Spécialités (catégories de produits)</Label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {availableGoodsCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`goods-${category}`}
                      checked={selectedGoodsCategories.includes(category)}
                      onChange={() => toggleGoodsCategory(category)}
                      className="rounded border-input"
                    />
                    <Label htmlFor={`goods-${category}`} className="text-sm">{category}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spécialités conditionnelles pour les services */}
          {formData.is_service_supplier && (
            <div className="space-y-2">
              <Label>Spécialités (catégories de services)</Label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {availableServiceCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`service-${category}`}
                      checked={selectedServiceCategories.includes(category)}
                      onChange={() => toggleServiceCategory(category)}
                      className="rounded border-input"
                    />
                    <Label htmlFor={`service-${category}`} className="text-sm">{category}</Label>
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
            <Button type="submit" disabled={createSupplier.isPending || updateSupplier.isPending || updateSupplierSpecialties.isPending}>
              {(createSupplier.isPending || updateSupplier.isPending || updateSupplierSpecialties.isPending) ? 'Sauvegarde...' : (supplier ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupplierModal;