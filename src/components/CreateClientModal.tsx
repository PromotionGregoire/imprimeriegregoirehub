import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateClient, useProfiles } from '@/hooks/useClientMutations';
import { useToast } from '@/hooks/use-toast';

const clientSchema = z.object({
  business_name: z.string().min(1, 'Le nom de l\'entreprise est obligatoire'),
  contact_name: z.string().min(1, 'Le nom du contact est obligatoire'),
  email: z.string().email('Format d\'email invalide'),
  phone_number: z.string().min(1, 'Le téléphone est obligatoire'),
  main_contact_position: z.string().optional(),
  secondary_contact_info: z.string().optional(),
  billing_street: z.string().optional(),
  billing_city: z.string().optional(),
  billing_province: z.string().optional(),
  billing_postal_code: z.string().optional(),
  shipping_street: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_province: z.string().optional(),
  shipping_postal_code: z.string().optional(),
  tax_numbers: z.string().optional(),
  default_payment_terms: z.string().optional(),
  client_type: z.string().optional(),
  industry: z.string().optional(),
  lead_source: z.string().optional(),
  status: z.string().optional(),
  assigned_user_id: z.string().optional(),
  general_notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateClientModal = ({ isOpen, onClose }: CreateClientModalProps) => {
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const createClient = useCreateClient();
  const { data: profiles } = useProfiles();
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      client_type: 'Entreprise',
      status: 'Prospect',
      default_payment_terms: 'Net 30 jours',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      // Si "Identique à l'adresse de facturation" est coché, copier les données
      if (sameAsBilling) {
        data.shipping_street = data.billing_street;
        data.shipping_city = data.billing_city;
        data.shipping_province = data.billing_province;
        data.shipping_postal_code = data.billing_postal_code;
      }

      await createClient.mutateAsync(data);
      toast({
        title: 'Client créé avec succès',
        description: `${data.business_name} a été ajouté à votre liste de clients.`,
      });
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du client.',
        variant: 'destructive',
      });
    }
  };

  const clientTypes = ['Entreprise', 'OSBL', 'École', 'Gouvernement'];
  const industries = ['Construction', 'Technologie', 'Santé', 'Détail', 'Manufacturing', 'Services', 'Éducation', 'Autre'];
  const leadSources = ['Référence', 'Google', 'Salon commercial', 'Client existant', 'Réseaux sociaux', 'Autre'];
  const statuses = ['Prospect', 'Actif', 'Inactif'];
  const provinces = ['QC', 'ON', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau Client</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="addresses">Adresses</TabsTrigger>
                <TabsTrigger value="admin">Administration</TabsTrigger>
              </TabsList>

              {/* Section 1: Informations Générales */}
              <TabsContent value="general" className="space-y-4">
                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nom de l'entreprise" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de client</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industrie</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une industrie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Section 2: Contacts */}
              <TabsContent value="contacts" className="space-y-4">
                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du contact principal *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nom du contact" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="main_contact_position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poste du contact principal</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Directeur général, Responsable marketing..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Courriel *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="contact@entreprise.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(514) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondary_contact_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact secondaire</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Nom, poste, téléphone, email du contact secondaire..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Section 3: Adresses */}
              <TabsContent value="addresses" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Adresse de facturation</h3>
                  
                  <FormField
                    control={form.control}
                    name="billing_street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rue</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 Rue Principal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="billing_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Montréal" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billing_province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Province" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {provinces.map((province) => (
                                <SelectItem key={province} value={province}>
                                  {province}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="billing_postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="H1A 1A1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Adresse d'expédition</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="same-as-billing" 
                      checked={sameAsBilling}
                      onCheckedChange={(checked) => setSameAsBilling(checked === true)}
                    />
                    <Label htmlFor="same-as-billing">
                      Identique à l'adresse de facturation
                    </Label>
                  </div>

                  {!sameAsBilling && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="shipping_street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rue</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123 Rue d'expédition" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="shipping_city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ville</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ville" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shipping_province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Province" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {provinces.map((province) => (
                                    <SelectItem key={province} value={province}>
                                      {province}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="shipping_postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="H1A 1A1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Section 4: Administration & Suivi */}
              <TabsContent value="admin" className="space-y-4">
                <FormField
                  control={form.control}
                  name="lead_source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="D'où vient ce prospect ?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leadSources.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax_numbers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéros de taxes (TPS/TVQ)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123456789 TPS, 987654321 TVQ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_payment_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Termes de paiement par défaut</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Net 30 jours" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut du client</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigned_user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employé assigné</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un employé" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {profiles?.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.full_name} ({profile.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="general_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes générales</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Notes internes sur le client, préférences, historique..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={createClient.isPending}>
                {createClient.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientModal;