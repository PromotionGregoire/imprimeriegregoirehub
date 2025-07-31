import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Mail, Calendar, Phone, AlertCircle, MoreVertical, Edit, Trash2, Key } from 'lucide-react';

interface Employee {
  id: string;
  full_name: string;
  role: string;
  job_title?: string;
  employment_status?: string;
  hire_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  password_reset_required?: boolean;
  created_at: string;
}

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'destructive';
    case 'ACCOUNTANT':
      return 'secondary';
    case 'EMPLOYEE':
    default:
      return 'default';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'ACCOUNTANT':
      return 'Comptable';
    case 'EMPLOYEE':
    default:
      return 'Employé';
  }
};

export const EmployeeCard = ({ employee, onEdit, onDelete, onResetPassword }: EmployeeCardProps) => {
  const initials = employee.full_name
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{employee.full_name}</h3>
              {employee.job_title && (
                <p className="text-sm text-muted-foreground">{employee.job_title}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2 items-end">
              <Badge variant={getRoleBadgeVariant(employee.role)}>
                {getRoleLabel(employee.role)}
              </Badge>
              {employee.password_reset_required && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Mot de passe temporaire
                </Badge>
              )}
            </div>
            
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border z-50">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(employee)} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                )}
                {onResetPassword && (
                  <DropdownMenuItem onClick={() => onResetPassword(employee)} className="cursor-pointer">
                    <Key className="h-4 w-4 mr-2" />
                    Réinitialiser mot de passe
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(employee)} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {employee.employment_status && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Statut:</span>
            <span className="font-medium">{employee.employment_status}</span>
          </div>
        )}
        
        {employee.hire_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Embauché:</span>
            <span className="font-medium">
              {new Date(employee.hire_date).toLocaleDateString('fr-CA')}
            </span>
          </div>
        )}

        {employee.emergency_contact_name && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contact d'urgence:</span>
            </div>
            <div className="pl-6 text-sm">
              <div className="font-medium">{employee.emergency_contact_name}</div>
              {employee.emergency_contact_phone && (
                <div className="text-muted-foreground">{employee.emergency_contact_phone}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};