import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useProductVariants } from '@/hooks/useProductVariants';
import { useState, useEffect } from 'react';

interface ProductLineItemProps {
  index: number;
  currentItem: any;
  products: any[] | undefined;
  register: any;
  setValue: any;
  onProductTypeChange: (index: number, productType: string) => void;
  onProductSelection: (index: number, productId: string) => void;
  onVariantSelection: (index: number, variantId: string, variants: any[]) => void;
  onRemove?: () => void;
  productsLoading: boolean;
}

export function ProductLineItem({
  index,
  currentItem,
  products,
  register,
  setValue,
  onProductTypeChange,
  onProductSelection,
  onVariantSelection,
  onRemove,
  productsLoading,
}: ProductLineItemProps) {
  const { data: variants } = useProductVariants(currentItem?.product_id);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Group variants by attribute_name for independent selection
  const groupedVariants = variants?.reduce((groups: Record<string, any[]>, variant: any) => {
    const attribute = variant.attribute_name;
    if (!groups[attribute]) {
      groups[attribute] = [];
    }
    // Remove duplicates based on attribute_value
    const exists = groups[attribute].find(v => v.attribute_value === variant.attribute_value);
    if (!exists) {
      groups[attribute].push(variant);
    }
    return groups;
  }, {}) || {};

  // Calculate price based on selected attributes
  useEffect(() => {
    if (!variants || Object.keys(selectedAttributes).length === 0) {
      setCalculatedPrice(0);
      return;
    }

    // Find variants that match all selected attributes
    const matchingVariants = variants.filter(variant => {
      return Object.entries(selectedAttributes).every(([attributeName, attributeValue]) => {
        return variant.attribute_name === attributeName && variant.attribute_value === attributeValue;
      });
    });

    // Sum up prices from matching variants
    const totalPrice = matchingVariants.reduce((sum, variant) => sum + (variant.price || 0), 0);
    setCalculatedPrice(totalPrice);
    
    // Update the unit price in the form
    setValue(`items.${index}.unit_price`, totalPrice);
    
    // Create variant details string
    const details = Object.entries(selectedAttributes)
      .map(([attr, value]) => `${attr}: ${value}`)
      .join(', ');
    setValue(`items.${index}.variant_details`, details);
  }, [selectedAttributes, variants, setValue, index]);

  const handleAttributeChange = (attributeName: string, attributeValue: string) => {
    const newSelected = {
      ...selectedAttributes,
      [attributeName]: attributeValue
    };
    setSelectedAttributes(newSelected);
  };

  // Reset selected attributes when product changes
  useEffect(() => {
    setSelectedAttributes({});
    setCalculatedPrice(0);
  }, [currentItem?.product_id]);

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-mono-200 px-4 py-3 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Type */}
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-medium text-mono-700">Type de produit</Label>
            <Select
              value={currentItem?.product_type || ''}
              onValueChange={(value) => onProductTypeChange(index, value)}
            >
              <SelectTrigger className="h-9 mt-1">
                <SelectValue placeholder="Type..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-border shadow-lg z-50">
                <SelectItem value="Impression">Impression</SelectItem>
                <SelectItem value="Article Promotionnel">Article Promotionnel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Selection */}
          <div className="flex-[2] min-w-0">
            <Label className="text-sm font-medium text-mono-700">Produit</Label>
            {currentItem?.product_type && !productsLoading ? (
              <Select
                value={currentItem?.product_id || ''}
                onValueChange={(value) => onProductSelection(index, value)}
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue placeholder="Sélectionner un produit..." />
                </SelectTrigger>
                <SelectContent className="bg-background border-border shadow-lg z-50">
                  {products
                    ?.filter(p => p.category === currentItem.product_type)
                    .map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                {...register(`items.${index}.product_name`)}
                placeholder="Nom du produit"
                className="h-9 mt-1"
              />
            )}
          </div>

          {/* Remove Button */}
          <div className="flex-shrink-0 self-end">
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-9"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      {currentItem?.product_id && variants && variants.length > 0 && (
        <div className="px-4 py-4 bg-mono-100 border-b border-border">
          <Label className="text-sm font-medium text-mono-700 mb-3 block">Configuration du produit</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(groupedVariants).map(([attributeName, attributeVariants]) => (
              <div key={attributeName} className="min-w-0">
                <Label className="text-xs text-mono-600 mb-1 block truncate">{attributeName}</Label>
                <Select
                  value={selectedAttributes[attributeName] || ''}
                  onValueChange={(value) => handleAttributeChange(attributeName, value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border shadow-lg z-50">
                    {attributeVariants.map((variant: any) => (
                      <SelectItem key={variant.id} value={variant.attribute_value}>
                        <div className="flex justify-between items-center w-full">
                          <span className="truncate">{variant.attribute_value}</span>
                          {variant.price > 0 && (
                            <span className="ml-2 text-xs text-positive flex-shrink-0">
                              +${variant.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          {Object.keys(selectedAttributes).length > 0 && (
            <div className="mt-4 p-3 bg-background rounded border border-border">
              <div className="text-xs text-mono-600 mb-1">
                Configuration sélectionnée: {Object.entries(selectedAttributes).map(([attr, value]) => `${attr}: ${value}`).join(', ')}
              </div>
              {calculatedPrice > 0 && (
                <div className="text-sm font-medium text-positive">
                  Prix calculé: ${calculatedPrice.toFixed(2)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Details Section */}
      <div className="px-4 py-4 space-y-4">
        {/* Description */}
        <div>
          <Label className="text-sm font-medium text-mono-700">Description</Label>
          <Textarea
            {...register(`items.${index}.description`)}
            placeholder="Description du produit"
            rows={2}
            className="mt-1 resize-none"
          />
        </div>
        
        {/* Bottom row: Quantity, Unit Price, Total */}
        <div className="grid grid-cols-3 gap-4">
          {/* Quantity */}
          <div>
            <Label className="text-sm font-medium text-mono-700">Quantité</Label>
            <Input
              type="number"
              min="1"
              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              className="mt-1"
            />
          </div>
          
          {/* Unit Price */}
          <div>
            <Label className="text-sm font-medium text-mono-700">Prix unitaire ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
              value={calculatedPrice || currentItem?.unit_price || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setValue(`items.${index}.unit_price`, value);
              }}
              className="mt-1"
            />
          </div>
          
          {/* Total */}
          <div>
            <Label className="text-sm font-medium text-mono-700">Total</Label>
            <div className="h-10 flex items-center mt-1 px-3 bg-mono-100 rounded border font-medium text-positive">
              ${((currentItem?.quantity || 0) * (calculatedPrice || currentItem?.unit_price || 0)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}