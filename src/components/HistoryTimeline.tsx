import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, User, Upload, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoryTimelineProps {
  orderId: string;
}

interface HistoryEvent {
  id: string;
  order_id: string;
  action_type: string;
  action_description: string;
  metadata: any;
  proof_id: string | null;
  client_action: boolean;
  created_at: string;
  formatted_date: string;
  author_name: string;
  employee_full_name: string | null;
  employee_job_title: string | null;
}

const getActionIcon = (actionType: string, clientAction: boolean) => {
  if (clientAction) return MessageSquare;
  
  switch (actionType) {
    case 'upload_epreuve':
      return Upload;
    case 'envoi_client':
      return Send;
    case 'changement_statut_epreuve':
      return CheckCircle;
    default:
      return Clock;
  }
};

const getActionColor = (actionType: string, clientAction: boolean) => {
  if (clientAction) return 'text-blue-600 bg-blue-50';
  
  switch (actionType) {
    case 'upload_epreuve':
      return 'text-green-600 bg-green-50';
    case 'envoi_client':
      return 'text-purple-600 bg-purple-50';
    case 'changement_statut_epreuve':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const HistoryTimeline = ({ orderId }: HistoryTimelineProps) => {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['order-history', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_order_history_details')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HistoryEvent[];
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Impossible de charger l'historique</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Aucun événement dans l'historique</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {history.map((event, index) => {
        const Icon = getActionIcon(event.action_type, event.client_action);
        const colorClasses = getActionColor(event.action_type, event.client_action);
        const isLast = index === history.length - 1;

        return (
          <div key={event.id} className="relative flex items-start gap-4">
            {/* Timeline connector */}
            {!isLast && (
              <div className="absolute left-5 top-10 w-px h-6 bg-border"></div>
            )}
            
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
              <Icon className="h-4 w-4" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {event.action_description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {event.formatted_date}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {event.author_name}
                      </span>
                    </div>
                  </div>
                  
                  {/* Additional metadata if available */}
                  {event.metadata && typeof event.metadata === 'object' && (
                    <div className="mt-2">
                      {event.metadata.version && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
                          Version {event.metadata.version}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};