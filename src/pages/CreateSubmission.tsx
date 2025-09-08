import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { CalendarIcon, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/useClients';
import { useCreateSubmission, SubmissionFormData } from '@/hooks/useSubmissions';
import { useProducts } from '@/hooks/useProducts';
import { useProductVariants } from '@/hooks/useProductVariants';
import { useToast } from '@/hooks/use-toast';
import { AdvancedDatePicker } from '@/components/ui/advanced-date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ProductLineItem } from '@/components/ProductLineItem';
import { validateRequiredFields, displayFieldErrors, scrollToFirstError, clearFieldErrors } from '@/utils/validation';

const submissionItemSchema = z.object({
  product_type: z.string().min(1, 'Le type de produit est requis'),
  product_id: z.string().optional(),
  product_variant_id: z.string().optional(),
  product_name: z.string().min(1, 'Le nom du produit est requis'),
  variant_details: z.string().optional(),
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

const CreateSubmission = () => {
  console.log('CreateSubmission component rendering...');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: clients, isLoading: clientsLoading, error: clientsError } = useClients();
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const createSubmission = useCreateSubmission();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const prefilledClientId = searchParams.get('client_id');
  console.log('Prefilled client ID:', prefilledClientId);
  console.log('Clients loading:', clientsLoading, 'error:', clientsError);
  console.log('Products loading:', productsLoading, 'error:', productsError);
  console.log('Clients data:', clients);
  console.log('Products data:', products);

  const form = useForm<FormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      client_id: '',
      deadline: undefined,
      items: [{
        product_type: '',
        product_id: '',
        product_variant_id: '',
        product_name: '',
        variant_details: '',
        description: '',
        quantity: 1,
        unit_price: 0,
      }],
      tax_region: 'quebec',
      manual_tps: 0,
      manual_tvq: 0,
    },
  });

  // Safe client prefilling - only when data is loaded and client exists
  useEffect(() => {
    if (prefilledClientId && clients && !clientsLoading) {
      const foundClient = clients.find(c => c.id === prefilledClientId);
      if (foundClient) {
        console.log('Setting prefilled client:', foundClient.business_name);
        form.setValue('client_id', prefilledClientId);
      } else {
        console.warn('Prefilled client not found:', prefilledClientId);
        // Don't set the value if client doesn't exist - let user select manually
      }
    }
  }, [prefilledClientId, clients, clientsLoading, form]);

  // Set current date as default
  const [currentDate, setCurrentDate] = useState(new Date());

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { watch, setValue, register } = form;
  const watchedItems = watch('items');
  const watchedTaxRegion = watch('tax_region');

  // Calculate subtotal safely
  const subtotal = watchedItems?.reduce((sum, item) => {
    return sum + ((item?.quantity || 0) * (item?.unit_price || 0));
  }, 0) || 0;

  // Calculate taxes based on region
  const calculateTaxes = () => {
    const manualTPS = watch('manual_tps') || 0;
    const manualTVQ = watch('manual_tvq') || 0;
    
    switch (watchedTaxRegion) {
      case 'quebec':
        return {
          tps: subtotal * 0.05,
          tvq: subtotal * 0.09975,
        };
      case 'ontario':
        return {
          tps: subtotal * 0.13, // HST
          tvq: 0,
        };
      case 'manual':
        return {
          tps: manualTPS,
          tvq: manualTVQ,
        };
      case 'none':
        return {
          tps: 0,
          tvq: 0,
        };
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
    setValue(`items.${index}.product_variant_id`, '');
    setValue(`items.${index}.product_name`, '');
    setValue(`items.${index}.variant_details`, '');
    setValue(`items.${index}.description`, '');
    setValue(`items.${index}.unit_price`, 0);
  };

  // Handle product selection
  const handleProductSelection = (index: number, productId: string) => {
    const selectedProduct = products?.find(p => p.id === productId);
    if (selectedProduct) {
      setValue(`items.${index}.product_id`, productId);
      setValue(`items.${index}.product_variant_id`, '');
      setValue(`items.${index}.product_name`, selectedProduct.name);
      setValue(`items.${index}.variant_details`, '');
      setValue(`items.${index}.description`, selectedProduct.description || '');
      setValue(`items.${index}.unit_price`, Number(selectedProduct.default_price));
    }
  };

  // Handle variant selection
  const handleVariantSelection = (index: number, variantId: string, variants: any[]) => {
    const selectedVariant = variants?.find(v => v.id === variantId);
    if (selectedVariant) {
      setValue(`items.${index}.product_variant_id`, variantId);
      
      // Build variant details string
      const variantDetails = `${selectedVariant.attribute_name}: ${selectedVariant.attribute_value}`;
      setValue(`items.${index}.variant_details`, variantDetails);
      
      // Use variant price if available, otherwise use product default price
      const variantPrice = selectedVariant.price || 0;
      setValue(`items.${index}.unit_price`, Number(variantPrice));
    }
  };

  const addItem = () => {
    append({
      product_type: '',
      product_id: '',
      product_variant_id: '',
      product_name: '',
      variant_details: '',
      description: '',
      quantity: 1,
      unit_price: 0,
    });
  };

  const handleSubmit = async (data: FormData, status: 'Brouillon' | 'Envoyée') => {
    try {
      setIsSubmitting(true);

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

      await createSubmission.mutateAsync({ submissionData, status });

      toast({
        title: 'Succès',
        description: status === 'Brouillon' 
          ? 'Soumission sauvegardée en brouillon'
          : 'Soumission envoyée au client',
      });

      navigate(`/dashboard/clients/${data.client_id}`);
    } catch (error) {
      console.error('Submission creation error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de la soumission',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      const errors = validateRequiredFields(form);
      
      if (Object.keys(errors).length > 0) {
        displayFieldErrors(form, errors);
        scrollToFirstError(form);
        return;
      }
      
      // Clear any existing errors on successful validation
      clearFieldErrors(form);
    }
    
    // If no validation errors, proceed with submission
    await handleSubmit(data, 'Envoyée');
  };

  const handleDraftSubmit = async (data: FormData) => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      // For draft, we might be more lenient, but still check basic required fields if needed
      clearFieldErrors(form);
    }
    
    // Save as draft
    await handleSubmit(data, 'Brouillon');
  };

  const onSubmit = handleFormSubmit;

  // Show loading state if critical data is still loading
  if (clientsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Nouvelle Soumission</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Chargement des données clients...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if clients failed to load
  if (clientsError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Nouvelle Soumission</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Erreur lors du chargement des clients</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Nouvelle Soumission</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-6xl">
          {/* Informations Générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="client_id">Client *</Label>
                  {prefilledClientId && clients ? (
                    <Input
                      id="client_id"
                      name="client_id"
                      value={clients?.find(c => c.id === prefilledClientId)?.business_name || 'Client introuvable'}
                      disabled
                      className="bg-muted"
                      aria-required="true"
                    />
                  ) : (
                    <Select
                      name="client_id"
                      value={watch('client_id')}
                      onValueChange={(value) => setValue('client_id', value)}
                      required
                    >
                      <SelectTrigger id="client_id" aria-required="true">
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.business_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(currentDate, 'dd/MM/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={(date) => date && setCurrentDate(date)}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={2125}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'échéance</FormLabel>
                      <FormControl>
                        <AdvancedDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Sélectionner une date d'échéance"
                          includeTime={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  const currentItem = watchedItems?.[index];
                  const selectedProductId = currentItem?.product_id;
                  
                  return (
                    <ProductLineItem
                      key={item.id}
                      index={index}
                      currentItem={currentItem}
                      products={products}
                      register={register}
                      setValue={setValue}
                      onProductTypeChange={handleProductTypeChange}
                      onProductSelection={handleProductSelection}
                      onVariantSelection={handleVariantSelection}
                      onRemove={fields.length > 1 ? () => remove(index) : undefined}
                      productsLoading={productsLoading}
                    />
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

          {/* Actions */}
          <div className="flex gap-4 justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard/submissions')}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.handleSubmit(handleDraftSubmit)()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer comme Brouillon'
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Enregistrer et Envoyer par Courriel'
              )}
            </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateSubmission;