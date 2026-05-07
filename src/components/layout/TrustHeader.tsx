'use client'

import { useProcessing } from '@/context/ProcessingContext'
import { NeoButton } from '@/components/ui/NeoButton'

export function TrustHeader() {
  const { mode, toggleMode } = useProcessing()
  const isPrivate = mode === 'client'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-base border-b-2 border-black flex items-center justify-between px-6">
      {/* Logo */}
      <a
        href="/"
        className="font-mono font-black text-primary text-xl border-2 border-primary px-3 py-1 leading-none hover:bg-primary hover:text-base transition-colors duration-100"
        aria-label="PicSize Pro home"
      >
        &lt;PIC-TRANSFORM/&gt;
      </a>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
        <a href="#" className="font-mono text-muted text-sm hover:text-text-base transition-colors">Docs</a>
        <a href="https://github.com" className="font-mono text-muted text-sm hover:text-text-base transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
      </nav>

      {/* Trust Widget */}
      <div className="flex items-center gap-3">
        {/* Status pill */}
        <div
          className="flex items-center gap-2 border-2 border-black bg-surface px-4 py-2 shadow-neo-sm"
          role="status"
          aria-live="polite"
          aria-label={`Processing mode: ${isPrivate ? 'Private local' : 'Cloud server'}`}
        >
          {/* LED indicator */}
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${isPrivate ? 'bg-success shadow-[0_0_8px_#17cf97]' : 'bg-primary shadow-[0_0_8px_#f5d547]'}`}
            aria-hidden="true"
          />
          <span className="font-mono text-muted text-xs uppercase tracking-widest hidden sm:inline">
            SYSTEM STATUS:
          </span>
          <span className={`font-mono text-xs font-bold uppercase tracking-widest ${isPrivate ? 'text-success' : 'text-primary'}`}>
            {isPrivate ? 'PRIVATE · LOCAL' : 'CLOUD · SERVER'}
          </span>
        </div>

        {/* Toggle button */}
        <NeoButton
          variant={isPrivate ? 'success' : 'primary'}
          onClick={toggleMode}
          aria-pressed={isPrivate}
          aria-label={`Switch to ${isPrivate ? 'server-side' : 'client-side privacy'} mode`}
        >
          [{isPrivate ? 'CLIENT' : 'SERVER'}]
        </NeoButton>
      </div>
    </header>
  )
}
