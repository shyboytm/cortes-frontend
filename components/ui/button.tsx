import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Base button styling: a rounded-full pill shape with hairline black/10 -
// white/10 borders, uppercase tracking-widest labels, and hover states that
// shift text/border opacity without a colored fill or shadow.
//
// pt-[2px] (with no matching pb) is a 1px optical-centering nudge, not a
// spacing choice: these buttons have a fixed height (h-8/h-9/h-10) and rely
// on `items-center` to vertically center their label, but the label still
// read as sitting slightly high inside the pill. Since box-sizing is
// border-box, the height itself doesn't grow — padding-top just shrinks the
// content box from the top, which shifts the centered content down by half
// of whatever padding-top is added. 2px in nets a 1px visible shift.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full pt-[2px] text-xs font-medium tracking-widest uppercase transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/30 dark:focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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
        // Default Cuelume feedback for every button built on this
        // component: a hover tick, and a press knock on click. Callers can
        // still override either by passing their own data-cuelume-* prop,
        // since these come before the {...props} spread below.
        data-cuelume-hover="tick"
        data-cuelume-press
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
