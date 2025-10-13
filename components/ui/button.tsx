import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rogue-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-rogue-forest text-white shadow hover:bg-rogue-pine",
        forest:
          "bg-rogue-forest text-white shadow hover:bg-rogue-pine",
        gold:
          "bg-rogue-gold text-rogue-forest shadow hover:bg-rogue-ochre",
        sage:
          "bg-rogue-sage text-white shadow hover:bg-rogue-steel",
        destructive:
          "bg-rogue-terracotta text-white shadow-sm hover:bg-rogue-copper",
        outline:
          "border-2 border-rogue-sage bg-transparent text-rogue-forest hover:bg-rogue-sage/10",
        secondary:
          "bg-rogue-cream text-rogue-forest shadow-sm hover:bg-rogue-sage/20",
        ghost: "bg-transparent hover:bg-rogue-sage/10 text-rogue-forest",
        link: "text-rogue-forest underline-offset-4 hover:underline hover:text-rogue-pine",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-8 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
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
