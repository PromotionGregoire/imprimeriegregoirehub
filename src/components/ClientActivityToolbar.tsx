import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface ClientActivityToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  activityFilter: string;
  onActivityChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
  searchPlaceholder?: string;
}

const activityOptions = [
  { value: 'all', label: 'Tous les clients' },
  { value: 'active_orders', label: 'Commandes actives' },
  { value: 'active_submissions', label: 'Soumissions actives' },
  { value: 'active_proofs', label: 'Épreuves actives' },
  { value: 'inactive_orders', label: 'Commandes inactives (+3 mois)' },
  { value: 'inactive_submissions', label: 'Soumissions inactives (+3 mois)' },
];

export const ClientActivityToolbar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  activityFilter,
  onActivityChange,
  statusOptions,
  searchPlaceholder = "Rechercher...",
}: ClientActivityToolbarProps) => {
  return (
    <div className="space-y-4">
      {/* Activity Filter - Top Left */}
      <div className="flex items-center justify-start">
        <Select value={activityFilter} onValueChange={onActivityChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filtrer par activité" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {activityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all">Tous les statuts</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};