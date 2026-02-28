import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white hover:bg-accent-hover shadow-glow hover:shadow-none active:scale-95',
        destructive:
          'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:scale-95',
        outline:
          'border border-border bg-transparent text-text-primary hover:bg-muted hover:border-accent/50 active:scale-95',
        ghost:
          'text-text-secondary hover:bg-muted hover:text-text-primary active:scale-95',
        success:
          'bg-success/10 text-success border border-success/30 hover:bg-success/20 active:scale-95',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
