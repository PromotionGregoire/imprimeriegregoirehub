import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useProductVariants } from '@/hooks/useProductVariants';

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

  // Group variants by attribute_name for better UX
  const groupedVariants = variants?.reduce((groups: Record<string, any[]>, variant: any) => {
    const attribute = variant.attribute_name;
    if (!groups[attribute]) {
      groups[attribute] = [];
    }
    groups[attribute].push(variant);
    return groups;
  }, {}) || {};

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
          <SelectContent>
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
            <SelectContent>
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

      {/* Variants Selection - Show when product is selected and has variants */}
      {currentItem?.product_id && variants && variants.length > 0 && (
        <div className="col-span-12 md:col-span-3">
          <Label>Variantes</Label>
          <Select
            value={currentItem?.product_variant_id || ''}
            onValueChange={(value) => onVariantSelection(index, value, variants)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une variante..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedVariants).map(([attributeName, attributeVariants]) => (
                <div key={attributeName}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {attributeName}
                  </div>
                  {attributeVariants.map((variant: any) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.attribute_value}
                      {variant.price > 0 && (
                        <span className="ml-2 text-sm text-green-600">
                          ${variant.price.toFixed(2)}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          {currentItem?.variant_details && (
            <div className="text-xs text-muted-foreground mt-1">
              {currentItem.variant_details}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className={`col-span-12 ${currentItem?.product_id && variants && variants.length > 0 ? 'md:col-span-2' : 'md:col-span-3'}`}>
        <Label>Description</Label>
        <Textarea
          {...register(`items.${index}.description`)}
          placeholder="Description du produit"
          rows={2}
        />
      </div>
      
      {/* Quantity */}
      <div className="col-span-6 md:col-span-1">
        <Label>Quantité</Label>
        <Input
          type="number"
          min="1"
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
        />
      </div>
      
      {/* Unit Price */}
      <div className="col-span-6 md:col-span-2">
        <Label>Prix unitaire ($)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
        />
      </div>
      
      {/* Total */}
      <div className="col-span-6 md:col-span-1 text-right pt-6">
        <div className="font-medium">
          ${((currentItem?.quantity || 0) * (currentItem?.unit_price || 0)).toFixed(2)}
        </div>
      </div>
      
      {/* Remove Button */}
      <div className="col-span-6 md:col-span-1 pt-6">
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
  );
}