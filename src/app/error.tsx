'use client'

import { useEffect } from 'react'
import { NeoButton } from '@/components/ui/NeoButton'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-6 text-center">
      <div className="border-4 border-black bg-surface p-8 shadow-neo-primary max-w-md w-full">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-black uppercase mb-4 text-error">Something went wrong</h2>
        <p className="font-mono text-muted mb-8 text-sm">
          {error.message || "An unexpected error occurred in the application."}
        </p>
        <NeoButton variant="primary" className="w-full text-lg" onClick={() => reset()}>
          TRY AGAIN
        </NeoButton>
      </div>
    </div>
  )
}
