import React from 'react'
import { cn } from '@/lib/utils'
import { Check, Clock, XCircle, FileText, Send, CheckCircle, Eye, RefreshCw } from 'lucide-react'

type SubmissionStatus = 'Brouillon' | 'Envoyée' | 'Acceptée' | 'Refusée' | 'En révision'

interface SubmissionStatusTimelineProps {
  status: SubmissionStatus
  className?: string
  showLabels?: boolean
  size?: 'compact' | 'default' | 'spacious'
}

const statusSteps = [
  {
    key: 'created',
    label: 'Créée',
    icon: FileText,
    completedStatuses: ['Brouillon', 'Envoyée', 'Acceptée', 'Refusée', 'En révision']
  },
  {
    key: 'sent',
    label: 'Envoyée',
    icon: Send,
    completedStatuses: ['Envoyée', 'Acceptée', 'Refusée', 'En révision']
  },
  {
    key: 'result',
    label: 'Résultat',
    icon: CheckCircle,
    completedStatuses: ['Acceptée', 'Refusée']
  }
]

export function SubmissionStatusTimeline({ 
  status, 
  className, 
  showLabels = true,
  size = 'default' 
}: SubmissionStatusTimelineProps) {
  const getCurrentStepIndex = () => {
    if (status === 'Brouillon') return 0
    if (status === 'Envoyée' || status === 'En révision') return 1
    if (status === 'Acceptée' || status === 'Refusée') return 3 // Past the last step, so all are completed
    return 0
  }

  const currentStepIndex = getCurrentStepIndex()
  
  const getStepState = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex && status !== 'Acceptée' && status !== 'Refusée') return 'current'
    if ((status === 'Acceptée' || status === 'Refusée') && stepIndex === 2) return 'completed'
    return 'upcoming'
  }

  const getResultIcon = () => {
    if (status === 'Acceptée') return CheckCircle
    if (status === 'Refusée') return XCircle
    return Clock
  }

  const getResultColor = () => {
    if (status === 'Acceptée') return 'text-[hsl(var(--status-green))]'
    if (status === 'Refusée') return 'text-[hsl(var(--status-red))]'
    return 'text-content-secondary'
  }

  const getResultLabel = () => {
    if (status === 'Acceptée') return 'Acceptée'
    if (status === 'Refusée') return 'Refusée'
    return 'En attente'
  }

  // BaseWeb spacing tokens and content density
  const sizeClasses = {
    compact: {
      icon: 'w-4 h-4',
      circle: 'min-w-[32px] min-h-[32px] w-8 h-8',
      line: 'h-1',
      text: 'text-[14px] leading-[1.2]',
      spacing: 'gap-2',
      margin: 'mt-2'
    },
    default: {
      icon: 'w-5 h-5',
      circle: 'min-w-[40px] min-h-[40px] w-10 h-10',
      line: 'h-1',
      text: 'text-[16px] leading-[1.5]',
      spacing: 'gap-4',
      margin: 'mt-4'
    },
    spacious: {
      icon: 'w-6 h-6',
      circle: 'min-w-[48px] min-h-[48px] w-12 h-12',
      line: 'h-1.5',
      text: 'text-[18px] leading-[1.5]',
      spacing: 'gap-6',
      margin: 'mt-6'
    }
  }

  const sizes = sizeClasses[size]

  return (
    <div className={cn('w-full max-w-full overflow-hidden', className)}>
      {/* BaseWeb Layout Grid Pattern - 8px spacing system */}
      <div className={cn(
        "flex items-center justify-between relative w-full",
        "px-2 md:px-4", // 16px mobile, 32px desktop margins
        sizes.spacing
      )}>
        {statusSteps.map((step, index) => {
          const stepState = getStepState(index)
          
          // Get the correct icon based on status and step
          let Icon = step.icon
          if (index === 1 && status === 'En révision') {
            Icon = RefreshCw
          } else if (index === 2) {
            Icon = getResultIcon()
          }
          
          const isCompleted = stepState === 'completed'
          const isCurrent = stepState === 'current'
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center relative z-10 min-w-0 flex-shrink-0">
                {/* BaseWeb Circle Pattern with proper touch targets */}
                <div
                  className={cn(
                    'rounded-full flex items-center justify-center transition-all duration-300',
                    'shadow-sm hover:shadow-md',
                    // BaseWeb elevation system
                    'border border-border',
                    sizes.circle,
                    {
                      'bg-primary text-white border-primary shadow-lg': isCompleted && index !== 2,
                      'bg-[hsl(var(--status-green))] text-white border-[hsl(var(--status-green))] shadow-lg': isCompleted && index === 2 && status === 'Acceptée',
                      'bg-[hsl(var(--status-red))] text-white border-[hsl(var(--status-red))] shadow-lg': isCompleted && index === 2 && status === 'Refusée',
                      'bg-primary/10 text-primary border-primary ring-2 ring-primary/20': isCurrent,
                      'bg-background text-content-secondary border-border': stepState === 'upcoming'
                    }
                  )}
                >
                  <Icon className={cn(sizes.icon, 'flex-shrink-0')} />
                </div>
                
                {/* BaseWeb Typography Pattern */}
                {showLabels && (
                  <div className={cn(
                    'font-medium text-center min-w-0 max-w-[80px]',
                    sizes.text,
                    sizes.margin
                  )}>
                    <div className={cn(
                      'transition-colors duration-300 truncate',
                      {
                        'text-primary': isCompleted && index !== 2,
                        'text-[hsl(var(--status-green))] font-semibold': isCompleted && index === 2 && status === 'Acceptée',
                        'text-[hsl(var(--status-red))] font-semibold': isCompleted && index === 2 && status === 'Refusée',
                        'text-primary font-semibold': isCurrent,
                        'text-content-secondary': stepState === 'upcoming'
                      }
                    )}>
                      {index === 2 ? getResultLabel() : step.label}
                    </div>
                  </div>
                )}
              </div>
              
              {/* BaseWeb Connecting Line Pattern */}
              {index < statusSteps.length - 1 && (
                <div className="flex-1 mx-2 md:mx-4 min-w-0">
                  <div
                    className={cn(
                      'w-full rounded-full transition-all duration-500',
                      sizes.line,
                      {
                        'bg-primary': index < currentStepIndex,
                        'bg-primary/30': index === currentStepIndex - 1,
                        'bg-border': index >= currentStepIndex
                      }
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* BaseWeb Badge Pattern with semantic colors */}
      <div className={cn("flex justify-center w-full", sizes.margin)}>
        <div className={cn(
          'px-4 py-2 rounded-full font-medium transition-all duration-200',
          // BaseWeb typography: 14px caption
          'text-[14px] leading-[1.2]',
          'max-w-full truncate',
          // BaseWeb elevation
          'shadow-sm border',
          {
            'bg-[hsl(var(--status-blue-light))] text-[hsl(var(--status-blue))] border-[hsl(var(--status-blue))]': status === 'Brouillon',
            'bg-[hsl(var(--status-orange-light))] text-[hsl(var(--status-orange))] border-[hsl(var(--status-orange))]': status === 'Envoyée' || status === 'En révision',
            'bg-[hsl(var(--status-green-light))] text-[hsl(var(--status-green))] border-[hsl(var(--status-green))]': status === 'Acceptée',
            'bg-[hsl(var(--status-red-light))] text-[hsl(var(--status-red))] border-[hsl(var(--status-red))]': status === 'Refusée'
          }
        )}>
          {status}
        </div>
      </div>
    </div>
  )
}