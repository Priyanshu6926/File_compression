import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NeoCardProps {
  children: ReactNode
  className?: string
  shadowVariant?: 'secondary' | 'primary' | 'success' | 'black'
}

export function NeoCard({ children, className, shadowVariant = 'secondary' }: NeoCardProps) {
  const variantClass = {
    secondary: '',
    primary:   'shadow-neo-primary',
    success:   'shadow-neo-success',
    black:     'shadow-neo-black',
  }[shadowVariant]

  return (
    <div className={cn('relative', variantClass, className)}>
      <div className="border-2 border-black bg-surface rounded p-0 h-full w-full">
        {children}
      </div>
    </div>
  )
}
