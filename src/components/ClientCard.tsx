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
      case 'Actif': return 'bg-positive-light text-positive border-positive/20';
      case 'Prospect': return 'bg-info-light text-info border-info/20';
      case 'Inactif': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 ease-uber cursor-pointer active:scale-[0.98] bg-card border-border/50 animate-fade-in" onClick={() => navigate(`/dashboard/clients/${id}`)}>
      <CardHeader className="pb-base-400 space-y-0">
        <div className="flex items-start justify-between gap-base-300">
          <div className="flex-1 min-w-0">
            <h3 className="text-base-550 md:text-base-400 font-semibold text-foreground mb-base-200 leading-tight">
              {business_name}
            </h3>
            <div className="space-y-base-100">
              <p className="text-base-300 md:text-base-300 text-foreground font-medium">
                {contact_name}
              </p>
              {main_contact_position && (
                <p className="text-base-200 text-muted-foreground leading-relaxed">
                  {main_contact_position}
                </p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-base-200 text-muted-foreground font-mono block mb-base-300">
              {client_number}
            </span>
            {status && (
              <Badge variant="outline" className={`${getStatusColor(status)} text-base-200 font-medium px-base-200 py-base-100`}>
                {status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-base-400 pt-0">
        <div className="space-y-base-300">
          <div className="flex items-start gap-base-300 text-base-300">
            <Mail className="h-base-400 w-base-400 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-foreground leading-relaxed break-all">{email}</span>
          </div>
          <div className="flex items-center gap-base-300 text-base-300">
            <Phone className="h-base-400 w-base-400 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground font-medium">{phone_number}</span>
          </div>
          {(billing_city || billing_province) && (
            <div className="flex items-start gap-base-300 text-base-300">
              <MapPin className="h-base-400 w-base-400 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-foreground leading-relaxed">
                {[billing_city, billing_province].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
        
        {(client_type || industry) && (
          <div className="flex gap-base-200 flex-wrap pt-base-300 border-t border-border/50">
            {client_type && (
              <Badge variant="secondary" className="text-base-200 font-medium px-base-200 py-base-100">
                {client_type}
              </Badge>
            )}
            {industry && (
              <Badge variant="outline" className="text-base-200 font-medium px-base-200 py-base-100">
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