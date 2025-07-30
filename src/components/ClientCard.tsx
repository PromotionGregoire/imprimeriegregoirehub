import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Mail, Phone, Building2 } from 'lucide-react';

interface ClientCardProps {
  business_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  client_number: string;
}

const ClientCard = ({ 
  business_name, 
  contact_name, 
  email, 
  phone_number, 
  client_number 
}: ClientCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
              {business_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {contact_name}
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {client_number}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground truncate">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{phone_number}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;