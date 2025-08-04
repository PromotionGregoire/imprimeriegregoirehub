import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAllOrderHistory, HistoryItem } from '@/hooks/useOrderHistory';
import { Search, Filter, Calendar, User, FileText } from 'lucide-react';

const actionTypeColors = {
  upload_epreuve: 'bg-blue-500 hover:bg-blue-600',
  send_epreuve: 'bg-green-500 hover:bg-green-600',
  approve_epreuve: 'bg-emerald-600 hover:bg-emerald-700',
  reject_epreuve: 'bg-orange-500 hover:bg-orange-600',
  add_comment: 'bg-gray-500 hover:bg-gray-600',
  changement_statut_epreuve: 'bg-purple-500 hover:bg-purple-600',
  send_reminder: 'bg-yellow-500 hover:bg-yellow-600',
  start_production: 'bg-indigo-500 hover:bg-indigo-600',
  update_order: 'bg-cyan-500 hover:bg-cyan-600',
  view_epreuve: 'bg-teal-500 hover:bg-teal-600'
};

const actionTypeLabels = {
  upload_epreuve: 'Épreuve téléchargée',
  send_epreuve: 'Épreuve envoyée',
  approve_epreuve: 'Épreuve approuvée',
  reject_epreuve: 'Modification demandée',
  add_comment: 'Commentaire ajouté',
  changement_statut_epreuve: 'Statut modifié',
  send_reminder: 'Rappel envoyé',
  start_production: 'Production lancée',
  update_order: 'Commande mise à jour',
  view_epreuve: 'Épreuve consultée'
};

export function HistoryTable() {
  const { data: history, isLoading, error } = useAllOrderHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActionType, setFilterActionType] = useState<string>('all');
  const [filterClientAction, setFilterClientAction] = useState<string>('all');

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          Erreur lors du chargement de l'historique
        </div>
      </Card>
    );
  }

  const filteredHistory = history?.filter((item: HistoryItem) => {
    const matchesSearch = 
      item.action_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActionType = filterActionType === 'all' || item.action_type === filterActionType;
    
    const matchesClientAction = 
      filterClientAction === 'all' ||
      (filterClientAction === 'client' && item.client_action) ||
      (filterClientAction === 'employee' && !item.client_action);

    return matchesSearch && matchesActionType && matchesClientAction;
  }) || [];

  const uniqueActionTypes = [...new Set(history?.map(item => item.action_type) || [])];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher dans l'historique..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterActionType} onValueChange={setFilterActionType}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Type d'action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {uniqueActionTypes.map(type => (
              <SelectItem key={type} value={type}>
                {actionTypeLabels[type as keyof typeof actionTypeLabels] || type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterClientAction} onValueChange={setFilterClientAction}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Auteur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="client">Actions client</SelectItem>
            <SelectItem value="employee">Actions employé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Type d'action
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Version
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Auteur
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune entrée d'historique trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {item.formatted_date}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`text-white ${actionTypeColors[item.action_type as keyof typeof actionTypeColors] || 'bg-gray-500'}`}
                      >
                        {actionTypeLabels[item.action_type as keyof typeof actionTypeLabels] || item.action_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={item.action_description}>
                        {item.action_description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {item.order_number || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {item.business_name || 'N/A'}
                        </div>
                        {item.contact_name && (
                          <div className="text-xs text-muted-foreground">
                            {item.contact_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.proof_version ? (
                        <Badge variant="outline" className="font-mono">
                          v{item.proof_version}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.client_action ? (
                          <>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Client</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">
                              {item.created_by_name || 'Système'}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Affichage de {filteredHistory.length} entrée(s) sur {history?.length || 0} au total
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Action client</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Action employé</span>
          </div>
        </div>
      </div>
    </div>
  );
}