import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllSubmissions } from '@/hooks/useAllSubmissions';
import { Skeleton } from '@/components/ui/skeleton';

const Submissions = () => {
  const navigate = useNavigate();
  const { data: submissions, isLoading } = useAllSubmissions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Brouillon': 'outline',
      'Envoyée': 'default',
      'Acceptée': 'secondary',
      'Modification Demandée': 'destructive',
      'Refusée': 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getRowClassName = (submission: any) => {
    if (submission.status !== 'Envoyée' || !submission.sent_at) return '';
    
    const sentDate = new Date(submission.sent_at);
    const daysSince = Math.floor((new Date().getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince > 10) return 'border-l-4 border-l-destructive';
    if (daysSince > 5) return 'border-l-4 border-l-orange-500';
    
    return '';
  };

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    
    return submissions.filter(submission => {
      const matchesSearch = !searchTerm || 
        submission.submission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.clients?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.clients?.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Soumissions</h1>
        <Button onClick={() => navigate('/dashboard/submissions/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Soumission
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par numéro, entreprise ou contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Brouillon">Brouillon</SelectItem>
                  <SelectItem value="Envoyée">Envoyée</SelectItem>
                  <SelectItem value="Acceptée">Acceptée</SelectItem>
                  <SelectItem value="Modification Demandée">Modification Demandée</SelectItem>
                  <SelectItem value="Refusée">Refusée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune soumission trouvée avec ces critères'
                  : 'Aucune soumission pour le moment'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card 
              key={submission.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${getRowClassName(submission)}`}
              onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
            >
              <CardContent className="p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="font-medium">{submission.submission_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(submission.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <div className="font-medium">{submission.clients?.business_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {submission.clients?.contact_name}
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-right">
                    <div className="font-medium">
                      {submission.total_price ? `$${Number(submission.total_price).toFixed(2)}` : '-'}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    {getStatusBadge(submission.status)}
                  </div>
                  
                  <div className="col-span-2 text-right">
                    <div className="text-sm text-muted-foreground">
                      {submission.clients?.profiles?.full_name || 'Non assigné'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Submissions;