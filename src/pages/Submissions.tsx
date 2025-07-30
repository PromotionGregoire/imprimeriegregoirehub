import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, FileText, Calendar, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllSubmissions } from '@/hooks/useAllSubmissions';
import { Skeleton } from '@/components/ui/skeleton';

const Submissions = () => {
  const navigate = useNavigate();
  const { data: submissions, isLoading } = useAllSubmissions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getSubmissionCardData = (submission: any) => {
    const sentDate = submission.sent_at ? new Date(submission.sent_at) : null;
    const daysSinceSent = sentDate ? Math.floor((new Date().getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    let borderColor = 'border-border'; // Default
    let badgeInfo = { 
      variant: 'outline' as 'default' | 'secondary' | 'destructive' | 'outline', 
      text: submission.status, 
      color: '' 
    };
    
    switch (submission.status) {
      case 'Acceptée':
        borderColor = 'border-l-4 border-l-[#CBE54E]';
        badgeInfo = { variant: 'secondary', text: 'Acceptée', color: 'bg-[#CBE54E] text-black' };
        break;
        
      case 'Modification Demandée':
        borderColor = 'border-l-4 border-l-[#308695]';
        badgeInfo = { variant: 'secondary', text: 'Modification Demandée', color: 'bg-[#308695] text-white' };
        break;
        
      case 'Refusée':
        borderColor = 'border-l-4 border-l-destructive';
        badgeInfo = { variant: 'destructive', text: 'Refusée', color: '' };
        break;
        
      case 'Envoyée':
        if (daysSinceSent > 10) {
          borderColor = 'border-l-4 border-l-[#D45769]';
          badgeInfo = { variant: 'destructive', text: 'Suivi Urgent', color: 'bg-[#D45769] text-white' };
        } else if (daysSinceSent > 5) {
          borderColor = 'border-l-4 border-l-[#e69d45]';
          badgeInfo = { variant: 'secondary', text: 'Suivi Requis', color: 'bg-[#e69d45] text-white' };
        } else {
          badgeInfo = { variant: 'default', text: 'Envoyée', color: '' };
        }
        break;
        
      case 'Brouillon':
        badgeInfo = { variant: 'outline', text: 'Brouillon', color: '' };
        break;
    }
    
    return { borderColor, badgeInfo, daysSinceSent };
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

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubmissions.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Aucune soumission trouvée avec ces critères'
                    : 'Aucune soumission pour le moment'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const cardData = getSubmissionCardData(submission);
            
            return (
              <Card 
                key={submission.id} 
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${cardData.borderColor}`}
                onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          {submission.submission_number}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-medium">
                          {submission.clients?.business_name}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={cardData.badgeInfo.variant}
                      className={cardData.badgeInfo.color || ''}
                    >
                      {cardData.badgeInfo.text}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date d'envoi:</span>
                      <span className="font-medium">
                        {submission.sent_at 
                          ? new Date(submission.sent_at).toLocaleDateString('fr-FR')
                          : 'Non envoyée'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Échéance:</span>
                      </div>
                      <span className="font-medium">
                        {submission.deadline 
                          ? new Date(submission.deadline).toLocaleDateString('fr-FR')
                          : 'Non définie'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <DollarSign className="h-3 w-3" />
                        <span>Montant:</span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        ${Number(submission.total_price || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Assigné à:</span>
                      <span className="font-medium">
                        {submission.clients?.profiles?.full_name || 'Non assigné'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Submissions;