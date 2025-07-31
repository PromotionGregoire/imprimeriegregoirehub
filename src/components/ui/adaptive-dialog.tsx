import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AdaptiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
  className?: string
}

interface AdaptiveDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface AdaptiveDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface AdaptiveDialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface AdaptiveDialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function AdaptiveDialog({ 
  open, 
  onOpenChange, 
  children, 
  title, 
  className 
}: AdaptiveDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <>
        {open && (
          <div className="fixed inset-0 z-50 bg-background">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b bg-background/95 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
            
            {/* Mobile Content */}
            <div className={cn("flex-1 overflow-auto", className)}>
              {children}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-auto", className)}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function AdaptiveDialogContent({ children, className }: AdaptiveDialogContentProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <div className={cn("p-4 pb-24", className)}>{children}</div>
  }
  
  return <div className={className}>{children}</div>
}

export function AdaptiveDialogHeader({ children, className }: AdaptiveDialogHeaderProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return null // Header is handled in the main component for mobile
  }
  
  return <DialogHeader className={className}>{children}</DialogHeader>
}

export function AdaptiveDialogTitle({ children, className }: AdaptiveDialogTitleProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return null // Title is handled in the main component for mobile
  }
  
  return <DialogTitle className={className}>{children}</DialogTitle>
}

export function AdaptiveDialogFooter({ children, className }: AdaptiveDialogFooterProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 safe-area-inset-bottom">
        <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
          {children}
        </div>
      </div>
    )
  }
  
  return <DialogFooter className={className}>{children}</DialogFooter>
}