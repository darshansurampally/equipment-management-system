import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[90px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary',
        'placeholder:text-text-muted resize-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
