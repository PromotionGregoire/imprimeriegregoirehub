import React from 'react'
import { cn } from '@/lib/utils'
import { Check, Clock, XCircle, FileText, Send, CheckCircle } from 'lucide-react'

type SubmissionStatus = 'Brouillon' | 'Envoyée' | 'Acceptée' | 'Refusée' | 'En révision'

interface SubmissionStatusTimelineProps {
  status: SubmissionStatus
  className?: string
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
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
  size = 'md' 
}: SubmissionStatusTimelineProps) {
  const getCurrentStepIndex = () => {
    if (status === 'Brouillon') return 0
    if (status === 'Envoyée' || status === 'En révision') return 1
    if (status === 'Acceptée' || status === 'Refusée') return 2
    return 0
  }

  const currentStepIndex = getCurrentStepIndex()
  
  const getStepState = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex) return 'current'
    return 'upcoming'
  }

  const getResultIcon = () => {
    if (status === 'Acceptée') return CheckCircle
    if (status === 'Refusée') return XCircle
    return Clock
  }

  const getResultColor = () => {
    if (status === 'Acceptée') return 'text-green-600'
    if (status === 'Refusée') return 'text-red-600'
    return 'text-muted-foreground'
  }

  const getResultLabel = () => {
    if (status === 'Acceptée') return 'Acceptée'
    if (status === 'Refusée') return 'Refusée'
    return 'En attente'
  }

  const sizeClasses = {
    sm: {
      icon: 'w-3 h-3',
      circle: 'w-6 h-6',
      line: 'h-0.5',
      text: 'text-xs'
    },
    md: {
      icon: 'w-4 h-4',
      circle: 'w-8 h-8',
      line: 'h-1',
      text: 'text-sm'
    },
    lg: {
      icon: 'w-5 h-5',
      circle: 'w-10 h-10',
      line: 'h-1.5',
      text: 'text-base'
    }
  }

  const sizes = sizeClasses[size]

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between relative">
        {statusSteps.map((step, index) => {
          const stepState = getStepState(index)
          const Icon = index === 2 ? getResultIcon() : step.icon
          const isCompleted = stepState === 'completed'
          const isCurrent = stepState === 'current'
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center relative z-10">
                {/* Circle with icon */}
                <div
                  className={cn(
                    'rounded-full flex items-center justify-center transition-all duration-300',
                    sizes.circle,
                    {
                      'bg-primary text-primary-foreground shadow-lg': isCompleted,
                      'bg-primary/20 text-primary ring-2 ring-primary/30 animate-pulse': isCurrent && index !== 2,
                      'bg-green-500 text-white shadow-lg': isCurrent && index === 2 && status === 'Acceptée',
                      'bg-red-500 text-white shadow-lg': isCurrent && index === 2 && status === 'Refusée',
                      'bg-muted text-muted-foreground': stepState === 'upcoming'
                    }
                  )}
                >
                  <Icon className={sizes.icon} />
                </div>
                
                {/* Label */}
                {showLabels && (
                  <div className={cn('mt-2 font-medium text-center', sizes.text)}>
                    <div className={cn(
                      'transition-colors duration-300',
                      {
                        'text-primary': isCompleted,
                        'text-primary font-semibold': isCurrent && index !== 2,
                        'text-green-600 font-semibold': isCurrent && index === 2 && status === 'Acceptée',
                        'text-red-600 font-semibold': isCurrent && index === 2 && status === 'Refusée',
                        'text-muted-foreground': stepState === 'upcoming'
                      }
                    )}>
                      {index === 2 ? getResultLabel() : step.label}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Connecting line */}
              {index < statusSteps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn(
                      'w-full rounded-full transition-all duration-500',
                      sizes.line,
                      {
                        'bg-primary': index < currentStepIndex,
                        'bg-primary/30': index === currentStepIndex - 1,
                        'bg-muted': index >= currentStepIndex
                      }
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Status badge */}
      <div className="mt-4 flex justify-center">
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-medium transition-all duration-300',
          {
            'bg-blue-100 text-blue-800': status === 'Brouillon',
            'bg-orange-100 text-orange-800': status === 'Envoyée' || status === 'En révision',
            'bg-green-100 text-green-800': status === 'Acceptée',
            'bg-red-100 text-red-800': status === 'Refusée'
          }
        )}>
          {status}
        </div>
      </div>
    </div>
  )
}