import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'ghost'
  children: ReactNode
}

export function NeoButton({ variant = 'primary', className, children, ...props }: NeoButtonProps) {
  const base = 'border-2 border-black font-mono font-bold text-sm uppercase tracking-tight px-4 py-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none'
  const variants = {
    primary: 'bg-primary text-black shadow-neo-sm',
    success: 'bg-success text-black shadow-neo-sm',
    ghost:   'bg-surface text-text-base shadow-neo-sm hover:bg-surface-alt',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
