---
plan: "1.3"
phase: 1
wave: 2
title: "Build TrustHeader and UploadZone Components"
depends_on: ["1.1", "1.2"]
requirements_addressed: [UPLD-01, UPLD-02]
files_modified:
  - src/components/layout/TrustHeader.tsx
  - src/components/upload/UploadZone.tsx
  - src/components/ui/NeoCard.tsx
  - src/components/ui/NeoButton.tsx
  - src/app/page.tsx
autonomous: true
---

# Plan 1.3 — Build TrustHeader and UploadZone Components

## Objective

Implement the `TrustHeader` (navigation bar with Privacy Mode toggle and LED indicator) and the `UploadZone` (drag-and-drop file picker with format validation and all state variants). These are the two most visible Phase 1 components.

## Tasks

<task id="1.3.1">
<title>Create NeoCard and NeoButton UI primitives</title>
<read_first>
- src/app/globals.css (has .neo-card, .neo-btn definitions)
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 6 Component Specs)
</read_first>
<action>
Create `src/components/ui/NeoCard.tsx`:

```tsx
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
    primary:   'neo-card-primary',
    success:   'neo-card-success',
    black:     'neo-card-black',
  }[shadowVariant]

  return (
    <div className={cn('neo-card', variantClass, className)}>
      <div className="border-2 border-black bg-surface rounded p-0">
        {children}
      </div>
    </div>
  )
}
```

Create `src/components/ui/NeoButton.tsx`:

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'ghost'
  children: ReactNode
}

export function NeoButton({ variant = 'primary', className, children, ...props }: NeoButtonProps) {
  const base = 'neo-btn border-2 border-black font-mono font-bold text-sm uppercase tracking-tight px-4 py-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
  const variants = {
    primary: 'bg-primary text-base shadow-neo-sm',
    success: 'bg-success text-base shadow-neo-sm',
    ghost:   'bg-surface text-text-base shadow-neo-sm hover:bg-surface-alt',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
```

Create `src/lib/utils.ts` (cn helper):

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Install clsx and tailwind-merge:
```bash
npm install clsx tailwind-merge
```
</action>
<acceptance_criteria>
- `src/components/ui/NeoCard.tsx` exists and contains `export function NeoCard(`
- `src/components/ui/NeoButton.tsx` exists and contains `export function NeoButton(`
- `src/lib/utils.ts` exists and contains `export function cn(`
- `package.json` contains `"clsx"` and `"tailwind-merge"`
- `npm run build` exits 0
</acceptance_criteria>
</task>

<task id="1.3.2">
<title>Build TrustHeader component with Privacy Mode toggle and LED</title>
<read_first>
- src/context/ProcessingContext.tsx (useProcessing hook, ProcessingMode type)
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 6.1 TrustHeader spec)
- src/components/ui/NeoButton.tsx
</read_first>
<action>
Create `src/components/layout/TrustHeader.tsx`:

```tsx
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
          className="flex items-center gap-2 border-2 border-black bg-surface px-4 py-2"
          role="status"
          aria-live="polite"
          aria-label={`Processing mode: ${isPrivate ? 'Private local' : 'Cloud server'}`}
        >
          {/* LED indicator */}
          <span
            className={`w-2 h-2 rounded-full led-pulse ${isPrivate ? 'bg-success' : 'bg-primary'}`}
            aria-hidden="true"
          />
          <span className="font-mono text-muted text-xs uppercase tracking-widest">
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
```
</action>
<acceptance_criteria>
- `src/components/layout/TrustHeader.tsx` exists
- File contains `export function TrustHeader(`
- File contains `useProcessing()`
- File contains `aria-pressed={isPrivate}`
- File contains `led-pulse`
- File contains `PRIVATE · LOCAL`
- `npm run build` exits 0
</acceptance_criteria>
</task>

<task id="1.3.3">
<title>Build UploadZone with drag-and-drop, format validation, and all states</title>
<read_first>
- src/context/ProcessingContext.tsx (setUploadedFile, clearFile)
- src/lib/metadata.ts (isFormatSupported, extractImageMetadata)
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 6.2 UploadZone spec)
</read_first>
<action>
Create `src/components/upload/UploadZone.tsx`:

```tsx
'use client'

import { useCallback, useRef, useState, DragEvent } from 'react'
import { useProcessing } from '@/context/ProcessingContext'
import { isFormatSupported, extractImageMetadata } from '@/lib/metadata'
import { cn } from '@/lib/utils'

type UploadState = 'idle' | 'dragover' | 'loading' | 'error'

const SUPPORTED_EXTENSIONS = '.heic,.heif,.jpg,.jpeg,.png,.webp,.avif,.tiff,.tif,.svg,.cr2,.nef,.arw,.dng,.raf,.rw2'

export function UploadZone() {
  const { setUploadedFile, clearFile, file: currentFile, preview } = useProcessing()
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!isFormatSupported(file)) {
      setState('error')
      setError(`Format not supported: ${file.name.split('.').pop()?.toUpperCase()}. Accepted: HEIC, RAW, WEBP, PNG, JPG, SVG, TIFF`)
      return
    }
    setState('loading')
    setError(null)
    try {
      const metadata = await extractImageMetadata(file)
      const previewUrl = URL.createObjectURL(file)
      setUploadedFile(file, metadata, previewUrl)
      setState('idle')
    } catch {
      setState('error')
      setError('Could not read file. Please try another image.')
    }
  }, [setUploadedFile])

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setState('idle')
    const dropped = e.dataTransfer.files[0]
    if (dropped) processFile(dropped)
  }, [processFile])

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setState('dragover') }
  const onDragLeave = () => setState('idle')
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) processFile(picked)
  }

  const borderStyles: Record<UploadState, string> = {
    idle:     'border-dashed border-2 border-black',
    dragover: 'border-4 border-primary',
    loading:  'border-2 border-success',
    error:    'border-2 border-error',
  }

  const shadowStyles: Record<UploadState, string> = {
    idle:     '',
    dragover: 'scale-[1.01]',
    loading:  '',
    error:    '',
  }

  // If file is uploaded — show preview state
  if (currentFile && preview) {
    return (
      <div className="neo-card">
        <div className="border-2 border-black bg-surface p-6 rounded">
          <div className="flex flex-col items-center gap-4">
            {/* Thumbnail */}
            <div className="border-2 border-black overflow-hidden" style={{ maxWidth: 200, maxHeight: 200 }}>
              <img
                src={preview}
                alt="Uploaded image preview"
                className="object-contain w-full h-full"
                style={{ maxWidth: 200, maxHeight: 200 }}
              />
            </div>
            {/* Replace button */}
            <button
              onClick={() => { clearFile(); setState('idle') }}
              className="font-mono text-xs text-muted border border-black px-3 py-1 hover:bg-surface-alt transition-colors"
              aria-label="Remove uploaded file and upload a new one"
            >
              REPLACE FILE
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="neo-card">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image — drag and drop or click to browse"
        className={cn(
          'bg-surface rounded min-h-[320px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-150',
          borderStyles[state],
          shadowStyles[state],
          state === 'dragover' && 'bg-surface-alt'
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS}
          className="sr-only"
          onChange={onInputChange}
          aria-hidden="true"
        />

        {state === 'loading' ? (
          <p className="font-mono text-success text-sm animate-pulse">READING FILE...</p>
        ) : (
          <>
            {/* Upload icon */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v13M7 8l5-5 5 5M5 19h14" stroke="#f5d547" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"/>
            </svg>

            <p className="font-black text-primary text-2xl uppercase tracking-tight text-center px-4">
              DROP FILES HERE
            </p>
            <p className="font-mono text-muted text-sm">or click to browse</p>

            {error ? (
              <p role="alert" className="font-mono text-error text-xs text-center px-6 max-w-sm">
                {error}
              </p>
            ) : (
              <p className="font-mono text-muted text-xs tracking-widest">
                HEIC · RAW · WEBP · PNG · JPG · SVG · TIFF
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```
</action>
<acceptance_criteria>
- `src/components/upload/UploadZone.tsx` exists
- File contains `export function UploadZone(`
- File contains `role="button"`
- File contains `aria-label="Upload image — drag and drop or click to browse"`
- File contains `onDrop` and `onDragOver` handlers
- File contains `isFormatSupported`
- File contains `DROP FILES HERE`
- File contains `REPLACE FILE`
- `npm run build` exits 0
</acceptance_criteria>
</task>

<task id="1.3.4">
<title>Update app/page.tsx to render TrustHeader and UploadZone in layout</title>
<read_first>
- src/app/page.tsx (current placeholder from Plan 1.1)
- src/components/layout/TrustHeader.tsx
- src/components/upload/UploadZone.tsx
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 4 Layout — 60/40 side-by-side)
</read_first>
<action>
Replace `src/app/page.tsx` with:

```tsx
import { TrustHeader } from '@/components/layout/TrustHeader'
import { UploadZone } from '@/components/upload/UploadZone'

export default function Home() {
  return (
    <main className="min-h-screen bg-base flex flex-col">
      <TrustHeader />

      {/* Main content — pushed down by fixed header */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 pt-[76px] pb-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left column — Upload (60%) */}
          <div className="flex-1 lg:w-[60%] flex flex-col gap-6">
            <h1 className="font-black text-text-base text-3xl uppercase tracking-tight">
              TRANSFORM ANY IMAGE
            </h1>
            <UploadZone />
          </div>

          {/* Right column — Controls (40%) — placeholder for Plan 1.4 */}
          <div className="lg:w-[40%] flex flex-col gap-6">
            <div className="border-2 border-black bg-surface p-6">
              <p className="font-mono text-muted text-xs">CONTROLS PANEL — Phase 1.4</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
```
</action>
<acceptance_criteria>
- `src/app/page.tsx` contains `import { TrustHeader }`
- `src/app/page.tsx` contains `import { UploadZone }`
- `src/app/page.tsx` contains `<TrustHeader />`
- `src/app/page.tsx` contains `<UploadZone />`
- `src/app/page.tsx` contains `TRANSFORM ANY IMAGE`
- `src/app/page.tsx` contains `lg:w-[60%]`
- `npm run build` exits 0
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - TrustHeader renders logo, nav links, status pill with LED, and mode toggle
  - Privacy Mode toggle changes text between CLIENT and SERVER, LED changes color
  - UploadZone accepts drag-and-drop and click-to-browse
  - Unsupported file types show error message with role="alert"
  - Valid file upload shows preview thumbnail and REPLACE FILE button
  - page.tsx renders both components in 60/40 layout
  - npm run build exits 0
```
