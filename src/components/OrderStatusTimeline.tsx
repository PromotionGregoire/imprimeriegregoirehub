import { Check, Clock, Package, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusTimelineProps {
  currentStatus: string;
  className?: string;
}

const OrderStatusTimeline = ({ currentStatus, className }: OrderStatusTimelineProps) => {
  const steps = [
    {
      key: "En attente de l'épreuve",
      label: "En attente d'épreuve",
      icon: Clock,
      description: "En attente de validation"
    },
    {
      key: "En production",
      label: "En production",
      icon: Package,
      description: "Fabrication en cours"
    },
    {
      key: "Expédiée",
      label: "Expédiée",
      icon: Truck,
      description: "Prête pour collecte"
    },
    {
      key: "Complétée",
      label: "Complétée",
      icon: Check,
      description: "Livraison terminée"
    }
  ];

  const getCurrentStepIndex = (status: string) => {
    switch (status) {
      case "En attente de l'épreuve":
        return 0;
      case "En production":
        return 1;
      case "Expédiée":
        return 2;
      case "Complétée":
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIndex = getCurrentStepIndex(currentStatus);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-4 h-full w-0.5 bg-border" />
        <div 
          className="absolute left-4 top-4 w-0.5 bg-primary transition-all duration-500"
          style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const Icon = step.icon;
            
            return (
              <div key={step.key} className="relative flex items-start gap-3">
                {/* Step Icon */}
                <div className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                  status === 'completed' && "bg-primary border-primary text-primary-foreground",
                  status === 'current' && "bg-primary border-primary text-primary-foreground animate-pulse",
                  status === 'upcoming' && "bg-background border-border text-muted-foreground"
                )}>
                  {status === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className={cn(
                    "text-sm font-medium transition-colors",
                    status === 'completed' && "text-foreground",
                    status === 'current' && "text-primary font-semibold",
                    status === 'upcoming' && "text-muted-foreground"
                  )}>
                    {step.label}
                  </div>
                  <div className={cn(
                    "text-xs transition-colors",
                    status === 'completed' && "text-muted-foreground",
                    status === 'current' && "text-muted-foreground",
                    status === 'upcoming' && "text-muted-foreground/70"
                  )}>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTimeline;