import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Building2, MapPin } from 'lucide-react';

interface ClientCardProps {
  id: string;
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
  id,
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
  const navigate = useNavigate();
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Actif': return 'bg-green-100 text-green-800 border-green-200';
      case 'Prospect': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Inactif': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] bg-card border-border/50" onClick={() => navigate(`/dashboard/clients/${id}`)}>
      <CardHeader className="pb-4 space-y-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-base font-semibold text-foreground mb-2 leading-tight">
              {business_name}
            </h3>
            <div className="space-y-1">
              <p className="text-sm md:text-sm text-foreground font-medium">
                {contact_name}
              </p>
              {main_contact_position && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {main_contact_position}
                </p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xs text-muted-foreground font-mono block mb-3">
              {client_number}
            </span>
            {status && (
              <Badge variant="outline" className={`${getStatusColor(status)} text-xs font-medium px-2 py-1`}>
                {status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-foreground leading-relaxed break-all">{email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground font-medium">{phone_number}</span>
          </div>
          {(billing_city || billing_province) && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-foreground leading-relaxed">
                {[billing_city, billing_province].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
        
        {(client_type || industry) && (
          <div className="flex gap-2 flex-wrap pt-3 border-t border-border/50">
            {client_type && (
              <Badge variant="secondary" className="text-xs font-medium px-2 py-1">
                {client_type}
              </Badge>
            )}
            {industry && (
              <Badge variant="outline" className="text-xs font-medium px-2 py-1">
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