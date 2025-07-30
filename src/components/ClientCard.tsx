import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Building2, MapPin } from 'lucide-react';

interface ClientCardProps {
  business_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  client_number: string;
  main_contact_position?: string;
  client_type?: string;
  industry?: string;
  status?: string;
  billing_city?: string;
  billing_province?: string;
}

const ClientCard = ({ 
  business_name, 
  contact_name, 
  email, 
  phone_number, 
  client_number,
  main_contact_position,
  client_type,
  industry,
  status,
  billing_city,
  billing_province
}: ClientCardProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Actif': return 'bg-green-100 text-green-800 border-green-200';
      case 'Prospect': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Inactif': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 mb-1">
              {business_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {contact_name}
              {main_contact_position && (
                <span className="text-xs block">{main_contact_position}</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-mono block mb-2">
              {client_number}
            </span>
            {status && (
              <Badge variant="outline" className={getStatusColor(status)}>
                {status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground truncate">{email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{phone_number}</span>
          </div>
          {(billing_city || billing_province) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {[billing_city, billing_province].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
        
        {(client_type || industry) && (
          <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
            {client_type && (
              <Badge variant="secondary" className="text-xs">
                {client_type}
              </Badge>
            )}
            {industry && (
              <Badge variant="outline" className="text-xs">
                {industry}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientCard;