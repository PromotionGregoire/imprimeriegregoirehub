import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  periodFilter: string;
  onPeriodChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
  searchPlaceholder?: string;
}

const periodOptions = [
  { value: 'all', label: 'Toute période' },
  { value: '7days', label: '7 derniers jours' },
  { value: '30days', label: 'Dernier mois' },
  { value: '90days', label: '3 derniers mois' },
  { value: '365days', label: 'Dernière année' },
];

export const DashboardToolbar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  periodFilter,
  onPeriodChange,
  statusOptions,
  searchPlaceholder = "Rechercher...",
}: DashboardToolbarProps) => {
  return (
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
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Period Filter */}
          <Select value={periodFilter} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrer par période" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};