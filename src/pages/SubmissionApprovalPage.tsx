import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Building2, 
  Calendar,
  Package,
  AlertCircle,
  Loader2,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Créer un client public pour les pages non authentifiées
const supabaseUrl = 'https://ytcrplsistsxfaxkfqqp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Y3JwbHNpc3RzeGZheGtmcXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODMwNjcsImV4cCI6MjA2OTQ1OTA2N30.rzKPK9GPPOUbZvTaqequy7KK2pBwG7wvxBAfAW-rwoE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SubmissionData {
  id: string;
  submission_number: string;
  status: string;
  total_price: number;
  created_at: string;
  valid_until: string;
  acceptance_token: string;
  clients: {
    business_name: string;
    contact_name: string;
    email: string;
    phone_number: string;
  };
  submission_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export default function SubmissionApprovalPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchSubmission();
  }, [token]);

  const fetchSubmission = async () => {
    if (!token) {
      console.log('Pas de token fourni');
      setLoading(false);
      return;
    }

    console.log('Recherche de la soumission avec le token:', token);

    try {
      // D'abord, essayer une requête simple
      const { data: simpleData, error: simpleError } = await supabase
        .from('submissions')
        .select('*')
        .eq('acceptance_token', token)
        .single();

      console.log('Requête simple:', { simpleData, simpleError });

      if (simpleError) {
        console.error('Erreur requête simple:', simpleError);
      }

      // Ensuite, essayer avec les relations
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          clients!inner (
            business_name,
            contact_name,
            email,
            phone_number
          ),
          submission_items (
            description,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('acceptance_token', token)
        .single();

      console.log('Requête complète:', { data, error });

      if (error) {
        console.error('Erreur détaillée:', error);
        
        // Si erreur de permissions, essayer sans authentification
        if (error.code === 'PGRST301') {
          console.log('Tentative sans authentification...');
          // La requête devrait déjà être sans auth, mais vérifier
        }
        
        toast({
          title: "❌ Erreur",
          description: error.message || "Soumission introuvable ou lien invalide",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!data) {
        console.log('Aucune donnée retournée');
        toast({
          title: "❌ Erreur",
          description: "Soumission introuvable",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Vérifier la structure des données
      console.log('Données reçues:', data);
      
      // S'assurer que valid_until existe, sinon le calculer
      const submissionData = {
        ...data,
        valid_until: data.valid_until || new Date(new Date(data.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      setSubmission(submissionData as any);
    } catch (error) {
      console.error('Erreur catch:', error);
      toast({
        title: "❌ Erreur",
        description: "Une erreur est survenue lors du chargement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!submission) return;

    setAccepting(true);
    try {
      const { data, error } = await supabase.functions.invoke('accept-submission', {
        body: { submissionId: submission.id }
      });

      if (error) throw error;

      toast({
        title: "✅ Soumission acceptée",
        description: "Votre commande a été créée avec succès. Vous recevrez bientôt l'épreuve à approuver.",
      });

      // Recharger pour afficher le nouveau statut
      await fetchSubmission();
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible d'accepter la soumission",
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!submission) return;

    setRejecting(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ 
          status: 'Refusée',
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast({
        title: "Soumission refusée",
        description: "La soumission a été marquée comme refusée.",
      });

      await fetchSubmission();
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de refuser la soumission",
        variant: "destructive"
      });
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement de la soumission...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Soumission introuvable</h2>
              <p className="text-muted-foreground">
                Le lien que vous avez utilisé est invalide ou a expiré.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(submission.valid_until) < new Date();
  const canAccept = submission.status === 'En attente' && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-primary text-white rounded-t-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Soumission {submission.submission_number}
              </h1>
              <div className="flex items-center gap-4 text-primary-foreground/90">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {submission.clients.business_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(submission.created_at), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
            <Badge 
              variant={submission.status === 'Acceptée' ? 'default' : 
                      submission.status === 'Refusée' ? 'destructive' : 
                      'secondary'}
              className="text-base px-3 py-1"
            >
              {submission.status}
            </Badge>
          </div>
        </div>

        {/* Contenu principal */}
        <Card className="rounded-t-none border-t-0">
          <CardHeader>
            <CardTitle>Détails de la soumission</CardTitle>
            <CardDescription>
              Veuillez examiner les détails ci-dessous avant d'accepter ou de refuser cette soumission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alerte si expiré */}
            {isExpired && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cette soumission a expiré le {format(new Date(submission.valid_until), 'dd MMMM yyyy', { locale: fr })}.
                  Veuillez nous contacter pour une nouvelle soumission.
                </AlertDescription>
              </Alert>
            )}

            {/* Alerte si déjà traité */}
            {submission.status === 'Acceptée' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Cette soumission a déjà été acceptée. Une commande a été créée et vous recevrez bientôt l'épreuve.
                </AlertDescription>
              </Alert>
            )}

            {submission.status === 'Refusée' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Cette soumission a été refusée. Veuillez nous contacter si vous souhaitez recevoir une nouvelle soumission.
                </AlertDescription>
              </Alert>
            )}

            {/* Informations client */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informations client
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Entreprise:</span>
                  <p className="font-medium">{submission.clients.business_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact:</span>
                  <p className="font-medium">{submission.clients.contact_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Courriel:</span>
                  <p className="font-medium">{submission.clients.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Téléphone:</span>
                  <p className="font-medium">{submission.clients.phone_number}</p>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Articles de la soumission
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="p-3 font-medium">Description</th>
                      <th className="p-3 font-medium text-right">Qté</th>
                      <th className="p-3 font-medium text-right">Prix unitaire</th>
                      <th className="p-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submission.submission_items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">{item.unit_price.toFixed(2)}$</td>
                        <td className="p-3 text-right font-medium">
                          {item.total_price.toFixed(2)}$
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/50">
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-semibold">
                        Total:
                      </td>
                      <td className="p-3 text-right font-bold text-lg">
                        {submission.total_price.toFixed(2)}$ CAD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Validité */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Validité:</strong> Cette soumission est valide jusqu'au{' '}
                <span className="font-semibold">
                  {format(new Date(submission.valid_until), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </p>
            </div>

            {/* Actions */}
            {canAccept && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  size="lg"
                  className="flex-1"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Acceptation en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accepter la soumission
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={rejecting}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  {rejecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refus en cours...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Refuser la soumission
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Contact */}
            <Separator />
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Des questions? Contactez-nous:</p>
              <div className="flex items-center justify-center gap-4">
                <a href={`mailto:${submission.clients.email}`} className="text-primary hover:underline">
                  <Send className="inline h-4 w-4 mr-1" />
                  {submission.clients.email}
                </a>
                <span>•</span>
                <a href={`tel:${submission.clients.phone_number}`} className="text-primary hover:underline">
                  {submission.clients.phone_number}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}