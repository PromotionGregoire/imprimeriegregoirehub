import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Tag, DollarSign } from 'lucide-react';
import { useProductVariants } from '@/hooks/useProductVariants';
import { useProductVariantMutations } from '@/hooks/useProductVariantMutations';

interface ProductVariantManagerProps {
  productId?: string;
  onVariantsChange?: (variants: any[]) => void;
}

interface AttributeGroup {
  name: string;
  values: Array<{
    value: string;
    sku: string;
    cost: number;
  }>;
}

const ProductVariantManager = ({ productId, onVariantsChange }: ProductVariantManagerProps) => {
  const [attributes, setAttributes] = useState<AttributeGroup[]>([]);
  const [newAttributeName, setNewAttributeName] = useState('');
  
  const { data: existingVariants } = useProductVariants(productId);
  const { createMultipleVariants, deleteVariant } = useProductVariantMutations();

  // Group existing variants by attribute name
  const groupedVariants = existingVariants?.reduce((groups, variant) => {
    const key = variant.attribute_name;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(variant);
    return groups;
  }, {} as Record<string, any[]>) || {};

  const addAttribute = () => {
    if (!newAttributeName.trim()) return;
    
    const newAttribute: AttributeGroup = {
      name: newAttributeName,
      values: [{ value: '', sku: '', cost: 0 }]
    };
    
    setAttributes([...attributes, newAttribute]);
    setNewAttributeName('');
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const addValueToAttribute = (attributeIndex: number) => {
    const updated = [...attributes];
    updated[attributeIndex].values.push({ value: '', sku: '', cost: 0 });
    setAttributes(updated);
  };

  const updateValue = (attributeIndex: number, valueIndex: number, field: 'value' | 'sku' | 'cost', newValue: string | number) => {
    const updated = [...attributes];
    if (field === 'cost') {
      updated[attributeIndex].values[valueIndex][field] = newValue as number;
    } else {
      updated[attributeIndex].values[valueIndex][field] = newValue as string;
    }
    setAttributes(updated);
    
    if (onVariantsChange) {
      const allVariants = attributes.flatMap(attr => 
        attr.values.map(val => ({
          attribute_name: attr.name,
          attribute_value: val.value,
          sku_variant: val.sku,
          cost_price: val.cost
        }))
      );
      onVariantsChange(allVariants);
    }
  };

  const removeValue = (attributeIndex: number, valueIndex: number) => {
    const updated = [...attributes];
    updated[attributeIndex].values.splice(valueIndex, 1);
    if (updated[attributeIndex].values.length === 0) {
      updated[attributeIndex].values.push({ value: '', sku: '', cost: 0 });
    }
    setAttributes(updated);
  };

  const saveVariants = () => {
    if (!productId) return;
    
    const variants = attributes.flatMap(attr => 
      attr.values
        .filter(val => val.value.trim())
        .map(val => ({
          attribute_name: attr.name,
          attribute_value: val.value,
          sku_variant: val.sku,
          cost_price: val.cost || 0
        }))
    );

    if (variants.length > 0) {
      createMultipleVariants.mutate({ productId, variants });
    }
  };

  const deleteExistingVariant = (variantId: string) => {
    deleteVariant.mutate(variantId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Gestion des Variantes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing variants */}
        {Object.keys(groupedVariants).length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Variantes existantes</h4>
            {Object.entries(groupedVariants).map(([attributeName, variants]) => (
              <div key={attributeName} className="space-y-2">
                <Label className="font-medium">{attributeName}</Label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <Badge key={variant.id} variant="secondary" className="flex items-center gap-1">
                      {variant.attribute_value}
                      {variant.cost_price > 0 && (
                        <span className="text-xs">({variant.cost_price}$)</span>
                      )}
                      <button
                        onClick={() => deleteExistingVariant(variant.id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new attribute */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Ajouter de nouvelles variantes</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Nom de l'attribut (ex: Taille, Couleur)"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
            />
            <Button onClick={addAttribute} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Attribute groups */}
        {attributes.map((attribute, attrIndex) => (
          <div key={attrIndex} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">{attribute.name}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttribute(attrIndex)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {attribute.values.map((value, valueIndex) => (
              <div key={valueIndex} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <Input
                    placeholder="Valeur"
                    value={value.value}
                    onChange={(e) => updateValue(attrIndex, valueIndex, 'value', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="SKU"
                    value={value.sku}
                    onChange={(e) => updateValue(attrIndex, valueIndex, 'sku', e.target.value)}
                  />
                </div>
                <div className="col-span-4">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Coût"
                      value={value.cost}
                      onChange={(e) => updateValue(attrIndex, valueIndex, 'cost', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeValue(attrIndex, valueIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => addValueToAttribute(attrIndex)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une valeur
            </Button>
          </div>
        ))}

        {/* Save button */}
        {attributes.length > 0 && productId && (
          <Button onClick={saveVariants} disabled={createMultipleVariants.isPending}>
            {createMultipleVariants.isPending ? 'Sauvegarde...' : 'Sauvegarder les variantes'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductVariantManager;
