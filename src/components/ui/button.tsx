import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Bold action - Uber's dominant style with our green
        primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:scale-[0.98]",
        // Secondary: Supporting action - outlined style per Uber Base
        secondary: "border border-primary text-primary bg-background hover:bg-primary/5 active:scale-[0.98]",
        // Tertiary: Subtle action - minimal style per Uber Base
        tertiary: "text-primary hover:bg-primary/10 active:scale-[0.98]",
        // Destructive: For delete/dangerous actions
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        // Outline: Traditional outlined button
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        // Ghost: Minimal, no background
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        // Link: Text-like button
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Mini: For compact interfaces (Uber Base mini)
        mini: "h-8 rounded-md px-3 text-xs",
        // Default: Standard button size (Uber Base default)
        default: "h-10 px-4 py-2",
        // Small: Alias for compact (backward compatibility)
        sm: "h-9 rounded-md px-3 text-sm",
        // Compact: Slightly smaller than default
        compact: "h-9 rounded-md px-3 text-sm",
        // Large: For prominent actions (Uber Base large) - Mobile optimized  
        lg: "h-11 rounded-md px-8",
        large: "h-12 rounded-lg px-8 text-base font-semibold",
        // Icon: Square button for icons
        icon: "h-10 w-10",
      },
      shape: {
        default: "",
        pill: "rounded-full",
        circle: "rounded-full aspect-square",
        square: "rounded-lg aspect-square",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      shape: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
