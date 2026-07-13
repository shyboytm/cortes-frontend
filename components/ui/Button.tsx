import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Kept close to the site's established "pill" language (see the RemixSequencer
// Shuffle/Clear buttons and the WorkRow view-more badge): rounded-full,
// hairline black/10 - white/10 borders, uppercase tracking-widest labels, and
// hover states that just shift text/border opacity rather than swapping in a
// colored fill — no shadows, no shadcn default blue/gray tokens.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-medium tracking-widest uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/30 dark:focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80",
        destructive:
          "border border-red-800/30 text-red-800 hover:bg-red-800/10 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10",
        outline:
          "border border-black/10 bg-transparent text-black/70 hover:border-black/30 hover:text-black dark:border-white/10 dark:text-white/70 dark:hover:border-white/30 dark:hover:text-white",
        secondary:
          "border border-black/10 bg-black/[0.03] text-black/70 hover:bg-black/[0.06] hover:text-black dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-white",
        ghost:
          "text-black/60 hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white",
        link: "text-current underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6 text-sm",
        icon: "h-9 w-9",
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
