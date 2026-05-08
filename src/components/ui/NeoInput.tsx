import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const NeoInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'border-2 border-black bg-base text-text-base font-mono text-lg px-4 py-3 w-full rounded-none focus:outline-none focus:ring-0 focus:border-primary transition-colors',
          className
        )}
        {...props}
      />
    )
  }
)
NeoInput.displayName = 'NeoInput'
