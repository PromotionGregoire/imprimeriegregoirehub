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
    <div className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg">
      {/* Product Type Selection */}
      <div className="col-span-12 md:col-span-2">
        <Label>Type de produit</Label>
        <Select
          value={currentItem?.product_type || ''}
          onValueChange={(value) => onProductTypeChange(index, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type..." />
          </SelectTrigger>
          <SelectContent className="bg-background border-border shadow-lg z-50">
            <SelectItem value="Impression">Impression</SelectItem>
            <SelectItem value="Article Promotionnel">Article Promotionnel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Selection */}
      <div className="col-span-12 md:col-span-3">
        <Label>Produit</Label>
        {currentItem?.product_type && !productsLoading ? (
          <Select
            value={currentItem?.product_id || ''}
            onValueChange={(value) => onProductSelection(index, value)}
          >
            <SelectTrigger>
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
          />
        )}
      </div>

      {/* Variants Selection - Show independent selectors for each attribute */}
      {currentItem?.product_id && variants && variants.length > 0 && (
        <div className="col-span-12 md:col-span-7 space-y-3">
          <Label>Configuration</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(groupedVariants).map(([attributeName, attributeVariants]) => (
              <div key={attributeName}>
                <Label className="text-xs text-muted-foreground">{attributeName}</Label>
                <Select
                  value={selectedAttributes[attributeName] || ''}
                  onValueChange={(value) => handleAttributeChange(attributeName, value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={`${attributeName}...`} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border shadow-lg z-50">
                    {attributeVariants.map((variant: any) => (
                      <SelectItem key={variant.id} value={variant.attribute_value}>
                        <div className="flex justify-between items-center w-full">
                          <span>{variant.attribute_value}</span>
                          {variant.price > 0 && (
                            <span className="ml-2 text-xs text-green-600">
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
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/20 rounded">
              <div>Configuration: {Object.entries(selectedAttributes).map(([attr, value]) => `${attr}: ${value}`).join(', ')}</div>
              {calculatedPrice > 0 && (
                <div className="text-green-600 font-medium">Prix calculé: ${calculatedPrice.toFixed(2)}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className={`col-span-12 ${currentItem?.product_id && variants && variants.length > 0 ? 'md:col-span-12 mt-4' : 'md:col-span-3'}`}>
        <Label>Description</Label>
        <Textarea
          {...register(`items.${index}.description`)}
          placeholder="Description du produit"
          rows={2}
        />
      </div>
      
      {/* Bottom row: Quantity, Unit Price, Total, Remove */}
      <div className="col-span-12 grid grid-cols-12 gap-4 items-end mt-4">
        {/* Quantity */}
        <div className="col-span-6 md:col-span-3">
          <Label>Quantité</Label>
          <Input
            type="number"
            min="1"
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          />
        </div>
        
        {/* Unit Price */}
        <div className="col-span-6 md:col-span-3">
          <Label>Prix unitaire ($)</Label>
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
          />
        </div>
        
        {/* Total */}
        <div className="col-span-6 md:col-span-3">
          <Label>Total</Label>
          <div className="h-10 flex items-center font-medium text-lg text-green-600">
            ${((currentItem?.quantity || 0) * (calculatedPrice || currentItem?.unit_price || 0)).toFixed(2)}
          </div>
        </div>
        
        {/* Remove Button */}
        <div className="col-span-6 md:col-span-3 flex justify-end">
          {onRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}