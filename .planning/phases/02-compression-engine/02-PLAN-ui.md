---
plan: "2.2"
phase: 2
wave: 2
title: "Compression Controls UI & Output Panel"
depends_on: ["2.1"]
requirements_addressed: [COMP-01, COMP-04, COMP-05]
files_modified:
  - src/components/controls/ControlsPanel.tsx
  - src/components/ui/NeoInput.tsx
  - src/app/page.tsx
autonomous: true
---

# Plan 2.2 — Compression Controls UI & Output Panel

## Objective

Build the right-side controls panel (`ControlsPanel`) allowing the user to specify a target file size and trigger the compression API. Build the resulting Output Panel (`OutputCard`) that displays the processed image, its new size, compression ratio, and a download button.

## Tasks

<task id="2.2.1">
<title>Create NeoInput UI primitive</title>
<read_first>
- src/components/ui/NeoButton.tsx
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 6.4)
</read_first>
<action>
Create `src/components/ui/NeoInput.tsx`:

```tsx
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
```
</action>
<acceptance_criteria>
- `src/components/ui/NeoInput.tsx` exists
- File contains `export const NeoInput = forwardRef`
- File contains `border-2 border-black` and `focus:border-primary`
- File contains `rounded-none`
</acceptance_criteria>
</task>

<task id="2.2.2">
<title>Build ControlsPanel component</title>
<read_first>
- src/components/ui/NeoInput.tsx
- src/components/ui/NeoButton.tsx
- src/context/ProcessingContext.tsx
</read_first>
<action>
Create `src/components/controls/ControlsPanel.tsx` to handle user input and API interaction:

```tsx
'use client'

import { useState } from 'react'
import { useProcessing } from '@/context/ProcessingContext'
import { NeoInput } from '@/components/ui/NeoInput'
import { NeoButton } from '@/components/ui/NeoButton'

export function ControlsPanel() {
  const { file } = useProcessing()
  const [targetSize, setTargetSize] = useState('100')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ url: string; size: number; hitFloor: boolean } | null>(null)

  const handleCompress = async () => {
    if (!file) return
    setIsProcessing(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetSizeKB', targetSize)

      const res = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Compression failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const newSize = Number(res.headers.get('X-New-Size'))
      const hitFloor = res.headers.get('X-Hit-Floor') === 'true'

      setResult({ url, size: newSize, hitFloor })
    } catch (err) {
      console.error(err)
      alert('Error during compression.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative shadow-neo-sm">
        <div className="border-2 border-black bg-surface p-6">
          <p className="font-mono text-muted text-xs uppercase tracking-widest mb-4">
            MAX FILE SIZE (KB)
          </p>
          <div className="flex items-center gap-2">
            <NeoInput
              type="number"
              min="10"
              value={targetSize}
              onChange={(e) => setTargetSize(e.target.value)}
              placeholder="100"
            />
            <span className="font-mono font-bold text-text-base">KB</span>
          </div>

          <NeoButton
            variant="success"
            className="w-full mt-6 text-lg py-3"
            onClick={handleCompress}
            disabled={!file || isProcessing}
          >
            {isProcessing ? 'PROCESSING...' : '⚡ CONVERT & COMPRESS'}
          </NeoButton>
        </div>
      </div>

      {result && (
        <div className="relative shadow-neo-primary">
          <div className="border-2 border-black bg-surface p-6">
            <h3 className="font-black text-primary uppercase text-lg mb-2">RESULT</h3>
            {result.hitFloor && (
              <p className="font-mono text-error text-xs mb-4 border border-error p-2">
                WARNING: Reached minimum quality floor. Could not hit exact target size.
              </p>
            )}
            <p className="font-mono text-sm mb-4">
              New Size: <strong>{(result.size / 1024).toFixed(1)} KB</strong>
            </p>
            <a
              href={result.url}
              download={`compressed-${file?.name || 'image'}.jpg`}
              className="inline-flex items-center justify-center border-2 border-black bg-primary text-black font-mono font-bold text-sm uppercase tracking-tight px-4 py-2 w-full hover:bg-white transition-colors"
            >
              DOWNLOAD
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
```
</action>
<acceptance_criteria>
- `src/components/controls/ControlsPanel.tsx` exists
- File contains `fetch('/api/compress'`
- File contains `MAX FILE SIZE (KB)` and `<NeoInput`
- File contains `<NeoButton` with text `⚡ CONVERT & COMPRESS`
- Output panel displays `New Size:` and a `DOWNLOAD` link
- Warning message appears if `hitFloor` is true
</acceptance_criteria>
</task>

<task id="2.2.3">
<title>Update page.tsx to render ControlsPanel</title>
<read_first>
- src/app/page.tsx
- src/components/controls/ControlsPanel.tsx
</read_first>
<action>
Replace the placeholder in `src/app/page.tsx` right column with `<ControlsPanel />`:

```tsx
import { TrustHeader } from '@/components/layout/TrustHeader'
import { UploadZone } from '@/components/upload/UploadZone'
import { MetadataPanel } from '@/components/upload/MetadataPanel'
import { ControlsPanel } from '@/components/controls/ControlsPanel'

export default function Home() {
  return (
    <main className="min-h-screen bg-base flex flex-col">
      <TrustHeader />

      <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 pt-[100px] pb-12">
        <div className="mb-8">
          <h1 className="font-black text-text-base text-4xl md:text-5xl uppercase tracking-tight leading-none">
            TRANSFORM ANY IMAGE
          </h1>
          <p className="font-mono text-muted text-sm mt-2">
            Upload · Convert · Compress · Download — hit exact size and format requirements
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <div className="w-full lg:w-[60%] flex flex-col gap-6">
            <UploadZone />
            <MetadataPanel />
          </div>

          <div className="w-full lg:w-[40%] flex flex-col gap-6">
            <ControlsPanel />
          </div>
        </div>
      </div>
    </main>
  )
}
```
</action>
<acceptance_criteria>
- `src/app/page.tsx` contains `import { ControlsPanel }`
- `src/app/page.tsx` contains `<ControlsPanel />`
- The `CONVERSION CONTROLS` placeholder text is completely removed
- `npm run build` exits 0
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - NeoInput component exists and matches design system
  - ControlsPanel component allows user to input a number
  - ControlsPanel triggers POST /api/compress using the current ProcessingContext file
  - ControlsPanel displays download link and new size on success
  - ControlsPanel displays quality floor warning if applicable
  - page.tsx renders ControlsPanel in the right column
  - npm run build passes with 0 errors
```
