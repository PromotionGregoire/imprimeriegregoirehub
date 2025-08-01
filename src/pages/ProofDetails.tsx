import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Send, FileText, Download, Clock, User, Package, ExternalLink, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const ProofDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch proof details
  const { data: proof, isLoading } = useQuery({
    queryKey: ['proof-details', id],
    queryFn: async () => {
      if (!id) throw new Error('Proof ID required');
      
      const { data, error } = await supabase
        .from('proofs')
        .select(`
          *,
          orders!inner (
            id,
            order_number,
            status,
            client_id,
            submission_id,
            clients (
              id,
              business_name,
              contact_name,
              email
            ),
            submissions (
              id,
              submission_number,
              status
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Upload file mutation
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      if (!proof) throw new Error('Proof not found');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${proof.id}/v${proof.version + 1}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(fileName);

      // Update proof with new file URL and increment version
      const { error: updateError } = await supabase
        .from('proofs')
        .update({
          file_url: publicUrl,
          version: proof.version + 1,
          status: 'En préparation',
          updated_at: new Date().toISOString()
        })
        .eq('id', proof.id);

      if (updateError) throw updateError;

      return { publicUrl, version: proof.version + 1 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proof-details', id] });
      setSelectedFile(null);
      toast({
        title: '✅ Fichier téléversé',
        description: 'Le fichier a été téléversé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de téléverser le fichier.',
        variant: 'destructive',
      });
    },
  });

  // Send to client mutation
  const sendToClient = useMutation({
    mutationFn: async () => {
      if (!proof) throw new Error('Proof not found');
      
      // Call the edge function to handle the entire send process
      const { error } = await supabase.functions.invoke('send-proof-to-client', {
        body: {
          proofId: proof.id
        }
      });

      if (error) throw new Error(error.message);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proof-details', id] });
      toast({
        title: '✅ Épreuve envoyée',
        description: 'L\'épreuve a été envoyée au client par courriel.',
      });
    },
    onError: (error) => {
      console.error('Send error:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'envoyer l\'épreuve au client.',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: '❌ Type de fichier non supporté',
          description: 'Veuillez sélectionner un fichier PDF, JPG ou PNG.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await uploadFile.mutateAsync(selectedFile);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'A preparer':
        return (
          <Badge 
            className="bg-warning-light text-warning border-warning/20 font-medium text-base-200 px-base-400 py-base-200 min-h-[32px] flex items-center"
            aria-label={`Statut: À préparer`}
          >
            À préparer
          </Badge>
        );
      case 'En préparation':
        return (
          <Badge 
            className="bg-info-light text-info border-info/20 font-medium text-base-200 px-base-400 py-base-200 min-h-[32px] flex items-center"
            aria-label={`Statut: En préparation`}
          >
            En préparation
          </Badge>
        );
      case 'Envoyée au client':
        return (
          <Badge 
            className="bg-primary/10 text-primary border-primary/20 font-medium text-base-200 px-base-400 py-base-200 min-h-[32px] flex items-center"
            aria-label={`Statut: Envoyé`}
          >
            Envoyé
          </Badge>
        );
      case 'Modification demandée':
        return (
          <Badge 
            className="bg-warning-light text-warning border-warning/20 font-medium text-base-200 px-base-400 py-base-200 min-h-[32px] flex items-center"
            aria-label={`Statut: Modification demandée`}
          >
            Modification demandée
          </Badge>
        );
      case 'Approuvée':
        return (
          <Badge 
            className="bg-positive-light text-positive border-positive/20 font-medium text-base-200 px-base-400 py-base-200 min-h-[32px] flex items-center"
            aria-label={`Statut: Approuvée`}
          >
            Approuvée
          </Badge>
        );
      default:
        return (
          <Badge 
            variant="secondary" 
            className="font-medium text-base-200 px-base-400 py-base-200 min-h-[32px] flex items-center"
            aria-label={`Statut: ${status}`}
          >
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!proof) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Épreuve non trouvée</h1>
        <Button onClick={() => navigate('/dashboard/proofs')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux épreuves
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header - Base Web Design System */}
      <div className="flex items-start justify-between gap-base-400 min-h-[60px]">
        <div className="flex items-start gap-base-400 sm:gap-base-500 lg:gap-base-600 min-w-0 flex-1">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/proofs')}
            className="min-h-[44px] min-w-[44px] p-base-300 flex-shrink-0"
            aria-label="Retour aux épreuves"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base-750 font-semibold text-foreground leading-tight mb-base-300">
              Épreuve v{proof.version}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-base-300 sm:gap-base-400">
              {getStatusBadge(proof.status)}
              <div className="flex items-center gap-base-200">
                <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2} />
                <span 
                  className="text-base-300 text-muted-foreground font-medium truncate"
                  title={`Commande ${proof.orders.order_number}`}
                  aria-label={`Numéro de commande: ${proof.orders.order_number}`}
                >
                  Commande {proof.orders.order_number}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards - Navigation Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Client Card - Clickable */}
        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-muted/20 border-primary/20"
          onClick={() => navigate(`/dashboard/clients/${proof.orders.clients.id}`)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client</CardTitle>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <ExternalLink className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary hover:underline">
              {proof.orders.clients.business_name}
            </div>
            <p className="text-xs text-muted-foreground">
              {proof.orders.clients.contact_name}
            </p>
            <p className="text-xs text-primary/60 mt-1">
              Cliquer pour voir le hub client →
            </p>
          </CardContent>
        </Card>

        {/* Order Card - Clickable */}
        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-muted/20 border-primary/20"
          onClick={() => navigate(`/dashboard/orders/${proof.orders.id}`)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commande</CardTitle>
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <ExternalLink className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary hover:underline">
              {proof.orders.order_number}
            </div>
            <p className="text-xs text-muted-foreground">
              Statut: {proof.orders.status}
            </p>
            <p className="text-xs text-primary/60 mt-1">
              Cliquer pour voir les détails →
            </p>
          </CardContent>
        </Card>

        {/* Submission Card - Clickable */}
        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-muted/20 border-primary/20"
          onClick={() => navigate(`/dashboard/submissions/${proof.orders.submissions.id}`)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumission d'Origine</CardTitle>
            <div className="flex items-center gap-1">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <ExternalLink className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary hover:underline">
              {proof.orders.submissions.submission_number}
            </div>
            <p className="text-xs text-muted-foreground">
              Statut: {proof.orders.submissions.status}
            </p>
            <p className="text-xs text-primary/60 mt-1">
              Cliquer pour voir la soumission →
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList className="flex overflow-x-auto scrollbar-hide w-full">
          <TabsTrigger value="manage" className="text-xs sm:text-sm truncate px-2 sm:px-3 lg:px-4 whitespace-nowrap">
            Gestion des Fichiers
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm truncate px-2 sm:px-3 lg:px-4 whitespace-nowrap">
            Historique
          </TabsTrigger>
          <TabsTrigger value="comments" className="text-xs sm:text-sm truncate px-2 sm:px-3 lg:px-4 whitespace-nowrap">
            Commentaires Client
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Téléverser une nouvelle version</CardTitle>
                <CardDescription>
                  Formats acceptés: PDF, JPG, PNG (max 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Sélectionner un fichier</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>
                
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{selectedFile.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}

                <Button 
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Téléversement...' : 'Téléverser'}
                </Button>
              </CardContent>
            </Card>

            {/* Current File Section */}
            <Card>
              <CardHeader>
                <CardTitle>Fichier actuel</CardTitle>
                <CardDescription>
                  Version {proof.version}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {proof.file_url ? (
                  <>
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Épreuve v{proof.version}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={proof.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    </div>

                    {proof.status === 'En préparation' && (
                      <Button
                        onClick={() => sendToClient.mutate()}
                        disabled={sendToClient.isPending}
                        className="w-full"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sendToClient.isPending ? 'Envoi...' : 'Envoyer au client pour approbation'}
                      </Button>
                    )}

                    {proof.status === 'Envoyée au client' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          ✅ Épreuve envoyée au client. En attente de leur réponse.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Aucun fichier téléversé pour cette épreuve.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des modifications</CardTitle>
              <CardDescription>
                Historique des versions et actions sur cette épreuve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-sm">
                  <div className="text-gray-500 whitespace-nowrap">
                    {format(new Date(proof.created_at), 'dd MMM yyyy - HH:mm', { locale: fr })}
                  </div>
                  <div className="text-gray-900">Épreuve créée</div>
                </div>
                {proof.updated_at !== proof.created_at && (
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="text-gray-500 whitespace-nowrap">
                      {format(new Date(proof.updated_at), 'dd MMM yyyy - HH:mm', { locale: fr })}
                    </div>
                    <div className="text-gray-900">
                      Dernière modification - Version {proof.version}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Commentaires du client</CardTitle>
              <CardDescription>
                Feedback et demandes de modification du client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proof.client_comments ? (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">
                    Demande de modification :
                  </h4>
                  <p className="text-orange-700">{proof.client_comments}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Aucun commentaire du client pour le moment.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProofDetails;