import { Check, Clock, Package, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusVisualTimelineProps {
  currentStatus: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const OrderStatusVisualTimeline = ({ 
  currentStatus, 
  className, 
  size = 'md',
  showLabels = true 
}: OrderStatusVisualTimelineProps) => {
  const steps = [
    {
      key: "En attente de l'épreuve",
      label: "En attente",
      icon: Clock,
      color: 'status-orange'
    },
    {
      key: "En production",
      label: "Production",
      icon: Package,
      color: 'status-green'
    },
    {
      key: "Expédiée",
      label: "Expédiée",
      icon: Truck,
      color: 'status-blue'
    },
    {
      key: "Complétée",
      label: "Complétée",
      icon: Check,
      color: 'status-purple'
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

  const sizeClasses = {
    sm: {
      icon: 'w-base-300 h-base-300',
      circle: 'w-base-500 h-base-500',
      line: 'h-0.5',
      text: 'text-base-200'
    },
    md: {
      icon: 'w-base-400 h-base-400',
      circle: 'w-base-600 h-base-600',
      line: 'h-1',
      text: 'text-base-300'
    },
    lg: {
      icon: 'w-base-500 h-base-500',
      circle: 'w-base-800 h-base-800',
      line: 'h-1.5',
      text: 'text-base-400'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const stepState = getStepStatus(index);
          const Icon = step.icon;
          const isCompleted = stepState === 'completed';
          const isCurrent = stepState === 'current';
          
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              {/* Circle with icon */}
              <div
                className={cn(
                  'rounded-full flex items-center justify-center transition-all ease-uber',
                  sizes.circle,
                  {
                    'bg-primary text-primary-foreground shadow-lg': isCompleted,
                    [`bg-[hsl(var(--${step.color}))] text-white shadow-lg`]: isCurrent,
                    'bg-muted text-muted-foreground': stepState === 'upcoming'
                  }
                )}
              >
                {isCompleted ? (
                  <Check className={sizes.icon} />
                ) : (
                  <Icon className={sizes.icon} />
                )}
              </div>
              
              {/* Label */}
              {showLabels && (
                <div className={cn('mt-base-200 font-medium text-center', sizes.text)}>
                  <div className={cn(
                    'transition-colors ease-uber',
                    {
                      'text-primary': isCompleted,
                      [`text-[hsl(var(--${step.color}))] font-semibold`]: isCurrent,
                      'text-muted-foreground': stepState === 'upcoming'
                    }
                  )}>
                    {step.label}
                  </div>
                </div>
              )}
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 left-full w-full flex-1 mx-base-200">
                  <div
                    className={cn(
                      'w-full rounded-full transition-all ease-uber',
                      sizes.line,
                      {
                        'bg-primary': index < currentStepIndex,
                        [`bg-[hsl(var(--${step.color}))]`]: index === currentStepIndex,
                        'bg-muted': index >= currentStepIndex
                      }
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusVisualTimeline;