import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useSubmissionDetails } from '@/hooks/useSubmissionDetails';
import { useUpdateSubmission, SubmissionFormData } from '@/hooks/useSubmissions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const submissionItemSchema = z.object({
  product_type: z.string().min(1, 'Le type de produit est requis'),
  product_id: z.string().optional(),
  product_name: z.string().min(1, 'Le nom du produit est requis'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'La quantité doit être au moins 1'),
  unit_price: z.number().min(0, 'Le prix unitaire doit être positif'),
});

const submissionSchema = z.object({
  client_id: z.string().min(1, 'Le client est requis'),
  deadline: z.date().optional(),
  items: z.array(submissionItemSchema).min(1, 'Au moins un produit est requis'),
  tax_region: z.string(),
  manual_tps: z.number().optional(),
  manual_tvq: z.number().optional(),
});

type FormData = z.infer<typeof submissionSchema>;

const EditSubmission = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: clients } = useClients();
  const { data: products } = useProducts();
  const { data: submission, isLoading } = useSubmissionDetails(id!);
  const updateSubmission = useUpdateSubmission();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      client_id: '',
      deadline: undefined,
      items: [{
        product_type: '',
        product_id: '',
        product_name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
      }],
      tax_region: 'quebec',
      manual_tps: 0,
      manual_tvq: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { watch, setValue, register, reset, formState: { errors, isValid } } = form;
  const watchedItems = watch('items');
  const watchedTaxRegion = watch('tax_region');
  
  // Watch all form values for change detection
  const watchedValues = useWatch({ control: form.control });

  // Load submission data when available
  useEffect(() => {
    if (submission) {
      const formData = {
        client_id: submission.client_id,
        deadline: submission.deadline ? new Date(submission.deadline) : undefined,
        items: submission.submission_items?.map((item: any) => ({
          product_type: '',
          product_id: '',
          product_name: item.product_name,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
        })) || [{
          product_type: '',
          product_id: '',
          product_name: '',
          description: '',
          quantity: 1,
          unit_price: 0,
        }],
        tax_region: 'quebec',
        manual_tps: 0,
        manual_tvq: 0,
      };
      
      reset(formData);
      // Set original data after a small delay to ensure form is populated
      setTimeout(() => {
        setOriginalData(formData);
        setHasChanges(false);
      }, 100);
    }
  }, [submission, reset]);

  // Detect changes in form values
  useEffect(() => {
    if (originalData && watchedValues) {
      // Simple comparison of key values that matter for changes
      const currentItems = watchedValues.items || [];
      const originalItems = originalData.items || [];
      
      const itemsChanged = JSON.stringify(currentItems) !== JSON.stringify(originalItems);
      const deadlineChanged = watchedValues.deadline?.getTime() !== originalData.deadline?.getTime();
      
      const hasChanged = itemsChanged || deadlineChanged;
      setHasChanges(hasChanged);
    }
  }, [watchedValues, originalData]);

  // Calculate subtotal
  const subtotal = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  // Calculate taxes based on region
  const calculateTaxes = () => {
    const manualTPS = watch('manual_tps') || 0;
    const manualTVQ = watch('manual_tvq') || 0;
    
    switch (watchedTaxRegion) {
      case 'quebec':
        return { tps: subtotal * 0.05, tvq: subtotal * 0.09975 };
      case 'ontario':
        return { tps: subtotal * 0.13, tvq: 0 };
      case 'manual':
        return { tps: manualTPS, tvq: manualTVQ };
      case 'none':
        return { tps: 0, tvq: 0 };
      default:
        return { tps: 0, tvq: 0 };
    }
  };

  const taxes = calculateTaxes();
  const total = subtotal + taxes.tps + taxes.tvq;

  // Handle product type change
  const handleProductTypeChange = (index: number, productType: string) => {
    setValue(`items.${index}.product_type`, productType);
    setValue(`items.${index}.product_id`, '');
    setValue(`items.${index}.product_name`, '');
    setValue(`items.${index}.description`, '');
    setValue(`items.${index}.unit_price`, 0);
  };

  // Handle product selection
  const handleProductSelection = (index: number, productId: string) => {
    const selectedProduct = products?.find(p => p.id === productId);
    if (selectedProduct) {
      setValue(`items.${index}.product_id`, productId);
      setValue(`items.${index}.product_name`, selectedProduct.name);
      setValue(`items.${index}.description`, selectedProduct.description || '');
      setValue(`items.${index}.unit_price`, Number(selectedProduct.default_price));
    }
  };

  const addItem = () => {
    append({
      product_type: '',
      product_id: '',
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
    });
  };

  const handleSubmit = async (data: FormData) => {
    console.log('=== EDIT SUBMISSION DEBUG ===');
    console.log('Form data received:', data);
    console.log('Submission ID:', id);
    console.log('Subtotal:', subtotal);
    console.log('Taxes:', taxes);
    console.log('Total:', total);
    
    try {
      setIsSubmitting(true);
      
      const previousTotal = Number(submission?.total_price || 0);
      
      const submissionData: SubmissionFormData = {
        client_id: data.client_id,
        deadline: data.deadline?.toISOString(),
        items: data.items.map(item => ({
          product_name: item.product_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        subtotal,
        tax_amount: taxes.tps + taxes.tvq,
        total_price: total,
      };

      console.log('Submission data to send:', submissionData);
      
      await updateSubmission.mutateAsync({ 
        id: id!, 
        submissionData,
        previousTotal, // Pour la journalisation détaillée
      });
      console.log('Update completed successfully');

      toast({
        title: '✅ Soumission mise à jour avec succès',
        description: `Les modifications ont été sauvegardées. Nouveau montant: ${total.toFixed(2)}$`,
      });

      // Reset change detection after successful save
      const newFormData = { ...watchedValues };
      setOriginalData(newFormData);
      setHasChanges(false);

      navigate(`/dashboard/submissions/${id}`);
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: '❌ Erreur lors de la sauvegarde',
        description: 'Veuillez réessayer. Si le problème persiste, contactez le support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation helpers
  const getFieldError = (fieldPath: string): string | undefined => {
    const keys = fieldPath.split('.');
    let error: any = errors;
    for (const key of keys) {
      error = error?.[key];
    }
    return error?.message as string | undefined;
  };

  const isFormValid = useMemo(() => {
    // Basic form validation: check required fields and that items exist
    const hasValidItems = watchedItems && watchedItems.length > 0 && watchedItems.every(item => 
      item.product_name && 
      item.product_name.trim() !== '' &&
      item.quantity > 0 && 
      item.unit_price >= 0
    );
    
    return hasValidItems && watchedItems.length > 0;
  }, [watchedItems]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Soumission introuvable</p>
          <Button onClick={() => navigate('/dashboard/submissions')} className="mt-4">
            Retour aux soumissions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/submissions/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">
          Modifier Soumission {submission.submission_number}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-6xl">
        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <Input
                    value={submission.clients?.business_name || ''}
                    disabled
                    className="bg-muted"
                  />
                  {getFieldError('client_id') && (
                    <p className="text-sm text-destructive mt-1">{getFieldError('client_id')}</p>
                  )}
                </div>
              
              <div>
                <Label>Date</Label>
                <Input
                  value={new Date(submission.created_at).toLocaleDateString('fr-FR')}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label>Date d'échéance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch('deadline') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('deadline') ? format(watch('deadline'), 'dd/MM/yyyy') : 'Sélectionner une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch('deadline')}
                      onSelect={(date) => setValue('deadline', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lignes de Produits */}
        <Card>
          <CardHeader>
            <CardTitle>Lignes de Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((item, index) => {
                const currentItem = watchedItems[index];
                return (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                    {/* Product Type Selection */}
                    <div className="col-span-2">
                      <Label>Type de produit</Label>
                      <Select
                        value={currentItem?.product_type || ''}
                        onValueChange={(value) => handleProductTypeChange(index, value)}
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
                    <div className="col-span-3">
                      <Label>Produit</Label>
                      {currentItem?.product_type ? (
                        <Select
                          value={currentItem?.product_id || ''}
                          onValueChange={(value) => handleProductSelection(index, value)}
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
                        <div>
                          <Input
                            {...register(`items.${index}.product_name`)}
                            placeholder="Nom du produit"
                            className={getFieldError(`items.${index}.product_name`) ? 'border-destructive' : ''}
                          />
                          {getFieldError(`items.${index}.product_name`) && (
                            <p className="text-xs text-destructive mt-1">{getFieldError(`items.${index}.product_name`)}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="col-span-3">
                      <Label>Description</Label>
                      <Textarea
                        {...register(`items.${index}.description`)}
                        placeholder="Description du produit"
                        rows={2}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className={getFieldError(`items.${index}.quantity`) ? 'border-destructive' : ''}
                      />
                      {getFieldError(`items.${index}.quantity`) && (
                        <p className="text-xs text-destructive mt-1">{getFieldError(`items.${index}.quantity`)}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <Label>Prix unitaire ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                        className={getFieldError(`items.${index}.unit_price`) ? 'border-destructive' : ''}
                      />
                      {getFieldError(`items.${index}.unit_price`) && (
                        <p className="text-xs text-destructive mt-1">{getFieldError(`items.${index}.unit_price`)}</p>
                      )}
                    </div>
                    
                    <div className="col-span-1 text-right pt-6">
                      <div className="font-medium">
                        ${((currentItem?.quantity || 0) * (currentItem?.unit_price || 0)).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="col-span-1 pt-6">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une ligne
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calcul des Totaux */}
        <Card>
          <CardHeader>
            <CardTitle>Calcul des Totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label>Région fiscale</Label>
                  <Select
                    value={watchedTaxRegion}
                    onValueChange={(value) => setValue('tax_region', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quebec">Québec (TPS 5% + TVQ 9.975%)</SelectItem>
                      <SelectItem value="ontario">Ontario (HST 13%)</SelectItem>
                      <SelectItem value="manual">Autre (Taxes manuelles)</SelectItem>
                      <SelectItem value="none">Pas de taxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {watchedTaxRegion === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>TPS ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('manual_tps', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label>TVQ ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('manual_tvq', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>
                    {watchedTaxRegion === 'ontario' ? 'HST:' : 'TPS:'}
                  </span>
                  <span>${taxes.tps.toFixed(2)}</span>
                </div>
                
                {watchedTaxRegion === 'quebec' && (
                  <div className="flex justify-between">
                    <span>TVQ:</span>
                    <span>${taxes.tvq.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Alert - Only show when form is actually invalid */}
        {!isFormValid && watchedItems && watchedItems.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Veuillez remplir tous les champs obligatoires avant de sauvegarder.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/submissions/${id}`)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (!hasChanges && originalData) || !isFormValid}
            className={cn(
              "min-w-[200px] transition-all",
              // Show primary color when form is ready to save
              (hasChanges || !originalData) && isFormValid ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde en cours...
              </>
            ) : !originalData ? (
              // Form is still loading
              'Chargement...'
            ) : !isFormValid ? (
              // Form has validation errors
              'Compléter les champs'
            ) : !hasChanges ? (
              // No changes made
              'Aucune modification'
            ) : (
              // Ready to save
              'Sauvegarder les modifications'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditSubmission;