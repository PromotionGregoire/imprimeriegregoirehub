import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Filter, FileText, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllSubmissions } from '@/hooks/useAllSubmissions';
import { Skeleton } from '@/components/ui/skeleton';
import StatusManager from '@/components/StatusManager';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Submissions = () => {
  const navigate = useNavigate();
  const { data: submissions, isLoading } = useAllSubmissions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculate dashboard stats
  const stats = {
    total: submissions?.length || 0,
    delivered: submissions?.filter(s => s.status === 'Livrée')?.length || 0,
    proofAccepted: submissions?.filter(s => s.status === 'Acceptée')?.length || 0,
    pendingApproval: submissions?.filter(s => s.status === 'Envoyée')?.length || 0,
    totalValue: submissions?.reduce((sum, s) => sum + (Number(s.total_price) || 0), 0) || 0
  };

  // Filter submissions
  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = 
      submission.submission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.clients?.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  const getCardStyle = (submission: any) => {
    const deadline = submission.deadline ? new Date(submission.deadline) : null;
    const today = new Date();
    const daysLeft = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    switch (submission.status) {
      case 'Livrée':
        return 'bg-purple-50 border-purple-200';
      case 'Acceptée':
        return 'bg-green-50 border-green-200';
      case 'Envoyée':
        if (daysLeft !== null && daysLeft <= 1) {
          return 'bg-red-50 border-red-200';
        } else if (daysLeft !== null && daysLeft <= 4) {
          return 'bg-orange-50 border-orange-200';
        }
        return 'bg-white border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getDeadlineText = (submission: any) => {
    const deadline = submission.deadline ? new Date(submission.deadline) : null;
    const today = new Date();
    const daysLeft = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    if (!deadline) return 'Non définie';
    if (daysLeft === 1) return `${formatDate(submission.deadline)} (1 day left)`;
    if (daysLeft && daysLeft > 1) return `${formatDate(submission.deadline)} (${daysLeft} days left)`;
    return formatDate(submission.deadline);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Soumissions</h1>
        <Button onClick={() => navigate('/dashboard/submissions/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Soumission
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Quotes</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-sm text-purple-600">Delivered</div>
            <div className="text-2xl font-bold text-purple-700">{stats.delivered}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-sm text-green-600">Proof Accepted</div>
            <div className="text-2xl font-bold text-green-700">{stats.proofAccepted}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="text-sm text-orange-600">Pending Approval</div>
            <div className="text-2xl font-bold text-orange-700">{stats.pendingApproval}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-blue-600">Total Value</div>
            <div className="text-2xl font-bold text-blue-700">{formatPrice(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Color Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium mb-3">Card Color Legend:</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-200 rounded"></div>
              <span>Purple - Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>Green - Proof Accepted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 rounded"></div>
              <span>Orange - Deadline ≤ 4 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span>Red - Deadline ≤ 1 day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Default - Normal status</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search quotes or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Brouillon">Brouillon</SelectItem>
                <SelectItem value="Envoyée">Envoyée</SelectItem>
                <SelectItem value="Acceptée">Acceptée</SelectItem>
                <SelectItem value="Refusée">Refusée</SelectItem>
                <SelectItem value="Livrée">Livrée</SelectItem>
              </SelectContent>
            </Select>
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
          filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onViewDetails={(id) => navigate(`/dashboard/submissions/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const SubmissionCard = ({ submission, onViewDetails }: { submission: any; onViewDetails: (id: string) => void }) => {
  const [proofAccepted, setProofAccepted] = useState(submission.status === 'Acceptée');
  const [delivered, setDelivered] = useState(submission.status === 'Livrée');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  const getCardStyle = () => {
    const deadline = submission.deadline ? new Date(submission.deadline) : null;
    const today = new Date();
    const daysLeft = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    switch (submission.status) {
      case 'Livrée':
        return 'bg-purple-50 border-purple-200';
      case 'Acceptée':
        return 'bg-green-50 border-green-200';
      case 'Envoyée':
        if (daysLeft !== null && daysLeft <= 1) {
          return 'bg-red-50 border-red-200';
        } else if (daysLeft !== null && daysLeft <= 4) {
          return 'bg-orange-50 border-orange-200';
        }
        return 'bg-white border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getDeadlineText = () => {
    const deadline = submission.deadline ? new Date(submission.deadline) : null;
    const today = new Date();
    const daysLeft = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    if (!deadline) return 'Non définie';
    if (daysLeft === 1) return `${formatDate(submission.deadline)} (1 day left)`;
    if (daysLeft && daysLeft > 1) return `${formatDate(submission.deadline)} (${daysLeft} days left)`;
    return formatDate(submission.deadline);
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${getCardStyle()}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Quote #{submission.submission_number}
              </h3>
              <p className="text-sm text-gray-500">
                {submission.clients?.business_name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(submission.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Date Sent:</span>
            <span className="text-sm font-medium">
              {submission.sent_at ? formatDate(submission.sent_at) : 'Not sent'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">📅 Deadline:</span>
            <span className="text-sm font-medium">
              {getDeadlineText()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Price:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(Number(submission.total_price) || 0)}
            </span>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Proof Accepted:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {proofAccepted ? 'Yes' : 'No'}
              </span>
              <Switch
                checked={proofAccepted}
                onCheckedChange={setProofAccepted}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Delivered:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {delivered ? 'Yes' : 'In Progress'}
              </span>
              <Switch
                checked={delivered}
                onCheckedChange={setDelivered}
              />
            </div>
          </div>
        </div>

        {/* View Proof Link */}
        {submission.approval_token && (
          <div className="pt-3 border-t border-gray-100">
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => window.open(`/approval/${submission.approval_token}`, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Proof Link →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Submissions;