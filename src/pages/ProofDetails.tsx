import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Send, FileText, Download, Clock, User, Package, ExternalLink, Receipt, Copy, Mail, Check } from 'lucide-react';
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
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HistoryTimeline } from '@/components/HistoryTimeline';

const ProofDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

  // Fetch all versions for this order
  const { data: allVersions, isLoading: versionsLoading } = useQuery({
    queryKey: ['proof-versions', proof?.order_id],
    queryFn: async () => {
      if (!proof?.order_id) return [];
      
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('order_id', proof.order_id)
        .order('version', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!proof?.order_id,
  });

  // Upload file mutation
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      if (!proof) throw new Error('Proof not found');
      
      // Calculate next version number based on existing versions for this order
      const nextVersion = (allVersions?.length || 0) + 1;
      
      // Generate unique ID for the new proof version
      const newProofId = crypto.randomUUID();
      const fileExt = file.name.split('.').pop();
      const fileName = `${newProofId}/v${nextVersion}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(fileName);

      // Create NEW proof entry instead of updating existing one
      const { error: insertError } = await supabase
        .from('proofs')
        .insert({
          id: newProofId,
          order_id: proof.order_id,
          file_url: publicUrl,
          version: nextVersion,
          status: 'En préparation',
          approval_token: crypto.randomUUID()
        });

      if (insertError) throw insertError;

      return { publicUrl, version: nextVersion, newProofId };
    },
    onSuccess: (data) => {
      // Redirect to the new proof version details page
      navigate(`/dashboard/proofs/${data.newProofId}`);
      
      queryClient.invalidateQueries({ queryKey: ['proof-versions', proof?.order_id] });
      setSelectedFile(null);
      toast({
        title: '✅ Nouvelle version créée',
        description: `Version ${data.version} créée avec succès.`,
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
      queryClient.invalidateQueries({ queryKey: ['proof-versions', proof?.order_id] });
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
      
      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        toast({
          title: '❌ Fichier trop volumineux',
          description: 'La taille maximale autorisée est de 50 MB.',
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
    return <StatusBadge status={status} type="proof" size="medium" />;
  };

  // Helper function to determine if client approval section should be visible
  const shouldShowClientApprovalSection = () => {
    // Show if proof has been sent to client (has validation_token) OR has specific statuses
    const validStatuses = ['Envoyée au client', 'Modification demandée', 'Approuvée'];
    return proof.validation_token || validStatuses.includes(proof.status);
  };

  // Helper function to get the approval URL
  const getApprovalUrl = () => {
    if (!proof.validation_token) return null;
    return `${window.location.origin}/approve/proof/${proof.validation_token}`;
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    const url = getApprovalUrl();
    if (!url) return;
    
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast({
        title: '✅ Lien copié',
        description: 'Le lien d\'approbation a été copié dans le presse-papiers.',
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: 'Impossible de copier le lien.',
        variant: 'destructive',
      });
    }
  };

  // Resend email mutation
  const resendEmail = useMutation({
    mutationFn: async () => {
      if (!proof) throw new Error('Proof not found');
      
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
        title: '✅ Courriel renvoyé',
        description: 'Le courriel d\'approbation a été renvoyé au client.',
      });
    },
    onError: (error) => {
      console.error('Resend email error:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de renvoyer le courriel.',
        variant: 'destructive',
      });
    },
  });

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
              Épreuve pour la Commande {proof.orders.order_number}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-base-300 sm:gap-base-400">
              <div className="flex items-center gap-base-300">
                <Badge variant="outline" className="font-medium">
                  Version {proof.version}
                </Badge>
                {/* Check if this is the latest version */}
                {allVersions && allVersions[0]?.id === proof.id && (
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    ✓ Version Active
                  </Badge>
                )}
                {/* Show button to go to latest version if viewing older version */}
                {allVersions && allVersions[0]?.id !== proof.id && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/proofs/${allVersions[0].id}`)}
                    className="text-xs"
                  >
                    Aller à la version la plus récente (V{allVersions[0].version})
                  </Button>
                )}
                {getStatusBadge(proof.status)}
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

      {/* Client Approval Section - Only show if proof has been sent to client */}
      {shouldShowClientApprovalSection() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Lien de Validation Client
            </CardTitle>
            <CardDescription>
              Gérer et visualiser le lien d'approbation envoyé au client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Approval URL Display */}
            {getApprovalUrl() && (
              <div className="space-y-3">
                <Label htmlFor="approval-url">URL d'approbation</Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <a
                      href={getApprovalUrl()!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                      id="approval-url"
                    >
                      {getApprovalUrl()}
                    </a>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    disabled={linkCopied}
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copier le lien
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => resendEmail.mutate()}
                    disabled={resendEmail.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {resendEmail.isPending ? 'Envoi...' : 'Renvoyer le courriel'}
                  </Button>
                </div>
              </div>
            )}
            
            {/* If no validation token exists */}
            {!getApprovalUrl() && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">
                  Aucun lien d'approbation disponible. Envoyez d'abord l'épreuve au client.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs - Base Web Design System */}
      <Tabs defaultValue="manage" className="space-y-base-600">
        <TabsList className="flex w-full bg-background border border-border rounded-md p-1 overflow-x-auto scrollbar-hide">
          <TabsTrigger 
            value="manage" 
            className="flex-1 min-w-0 text-sm font-medium px-3 py-2.5 min-h-[40px] flex items-center justify-center transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm whitespace-nowrap"
            aria-label="Onglet Gestion des Fichiers"
          >
            <span className="truncate">Gestion</span>
            <span className="hidden sm:inline ml-1">des Fichiers</span>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex-1 min-w-0 text-sm font-medium px-3 py-2.5 min-h-[40px] flex items-center justify-center transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm whitespace-nowrap"
            aria-label="Onglet Historique"
          >
            <span className="truncate">Historique</span>
          </TabsTrigger>
          <TabsTrigger 
            value="comments" 
            className="flex-1 min-w-0 text-sm font-medium px-3 py-2.5 min-h-[40px] flex items-center justify-center transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm whitespace-nowrap"
            aria-label="Onglet Commentaires Client"
          >
            <span className="truncate">Commentaires</span>
            <span className="hidden md:inline ml-1">Client</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Versions</CardTitle>
              <CardDescription>
                Gestion des versions et échanges avec le client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Next Version Section */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-medium text-lg mb-3">
                  Téléverser la Version {(allVersions?.length || 0) + 1}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Sélectionner un fichier</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Formats acceptés: PDF, JPG, PNG (max 50MB)
                    </p>
                  </div>
                  
                  {selectedFile && (
                    <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
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
                    {uploading ? 'Téléversement...' : 'Téléverser la nouvelle version'}
                  </Button>
                </div>
              </div>

              {/* All Versions History */}
              {versionsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : (
                 <div className="space-y-4">
                  {allVersions?.map((version, index) => (
                    <div key={version.id} className={`border rounded-lg p-4 ${index === 0 ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">
                            Version {version.version} - Envoyée le {format(new Date(version.updated_at), 'dd MMM yyyy', { locale: fr })}
                          </h3>
                          {index === 0 && (
                            <Badge variant="default" className="bg-primary text-primary-foreground">
                              ✓ Version Active
                            </Badge>
                          )}
                        </div>
                        <Badge 
                          variant={
                            version.status === 'Approuvée' ? 'default' :
                            version.status === 'Modification demandée' ? 'destructive' :
                            version.status === 'Envoyée au client' ? 'secondary' :
                            'outline'
                          }
                        >
                          {version.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Épreuve v{version.version}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {version.file_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={version.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                              </a>
                            </Button>
                          )}
                          
                          {version.status === 'En préparation' && index === 0 && (
                            <Button
                              onClick={() => sendToClient.mutate()}
                              disabled={sendToClient.isPending}
                              size="sm"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {sendToClient.isPending ? 'Envoi...' : 'Envoyer au client'}
                            </Button>
                          )}
                          
                          {version.status === 'Envoyée au client' && version.approval_token && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a 
                                  href={`/epreuve/${version.approval_token}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Voir page client
                                </a>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = `${window.location.origin}/epreuve/${version.approval_token}`;
                                  navigator.clipboard.writeText(link);
                                  toast({
                                    title: '✅ Lien copié',
                                    description: 'Le lien d\'approbation a été copié dans le presse-papiers.',
                                  });
                                }}
                              >
                                📋 Copier le lien
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {version.client_comments && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <h4 className="font-medium text-orange-800 mb-2">
                            Commentaires du client :
                          </h4>
                          <p className="text-orange-700 text-sm">{version.client_comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(!allVersions || allVersions.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune version disponible pour cette épreuve.
                    </p>
                  )}
                </div>
              )}

              {/* Current Version Block - KEEP ORIGINAL */}
              {false && proof.file_url && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">
                      Version {proof.version} - Envoyée le {format(new Date(proof.updated_at), 'dd MMM yyyy', { locale: fr })}
                    </h3>
                    <Badge 
                      variant={
                        proof.status === 'Approuvée' ? 'default' :
                        proof.status === 'Modification demandée' ? 'destructive' :
                        proof.status === 'Envoyée au client' ? 'secondary' :
                        'outline'
                      }
                    >
                      {proof.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
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
                      
                      {proof.status === 'En préparation' && (
                        <Button
                          onClick={() => sendToClient.mutate()}
                          disabled={sendToClient.isPending}
                          size="sm"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {sendToClient.isPending ? 'Envoi...' : 'Envoyer au client'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Client Comments if any */}
                  {proof.client_comments && proof.status === 'Modification demandée' && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">
                        Commentaires du client :
                      </h4>
                      <p className="text-orange-700 text-sm">{proof.client_comments}</p>
                    </div>
                  )}

                  {/* Client validation link */}
                  {proof.status === 'Envoyée au client' && proof.approval_token && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3">
                        ✅ Épreuve envoyée au client. En attente de leur réponse.
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-blue-700 font-medium">Lien de validation client :</p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="text-xs"
                          >
                            <a 
                              href={`/epreuve/${proof.approval_token}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Voir la page client
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/epreuve/${proof.approval_token}`);
                              toast({
                                title: "Lien copié",
                                description: "Le lien de validation a été copié dans le presse-papiers.",
                              });
                            }}
                          >
                            Copier le lien
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No file uploaded state */}
              {!proof.file_url && (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun fichier téléversé pour cette épreuve.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Utilisez le formulaire ci-dessus pour téléverser la première version.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des modifications</CardTitle>
              <CardDescription>
                Historique complet des actions pour cette commande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HistoryTimeline orderId={proof.orders.id} />
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