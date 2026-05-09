---
plan: "3.2"
phase: 3
wave: 2
title: "Resize Controls UI & Smart Crop"
depends_on: ["3.1"]
requirements_addressed: [RSZR-01, RSZR-02, RSZR-03, RSZR-04]
files_modified:
  - src/components/controls/ControlsPanel.tsx
autonomous: true
---

# Plan 3.2 — Resize Controls UI & Smart Crop

## Objective

Build the user interface for dimension controls in the right-side `ControlsPanel`. Allow users to specify width and height in pixels, toggle aspect-ratio locking, and enable Smart Crop with anchor selection.

## Tasks

<task id="3.2.1">
<title>Update ControlsPanel with dimension inputs</title>
<read_first>
- src/components/controls/ControlsPanel.tsx
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 6.4)
</read_first>
<action>
Update `src/components/controls/ControlsPanel.tsx` to include "RESIZE OPTIONS":

```tsx
'use client'

import { useState } from 'react'
import { useProcessing } from '@/context/ProcessingContext'
import { NeoInput } from '@/components/ui/NeoInput'
import { NeoButton } from '@/components/ui/NeoButton'
import { cn } from '@/lib/utils'

export function ControlsPanel() {
  const { file } = useProcessing()
  const [targetSize, setTargetSize] = useState('100')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [isSmartCrop, setIsSmartCrop] = useState(false)
  const [cropAnchor, setCropAnchor] = useState<'center' | 'top' | 'entropy'>('center')
  
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
      if (width) formData.append('width', width)
      if (height) formData.append('height', height)
      if (isSmartCrop) formData.append('crop', cropAnchor)

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
        <div className="border-2 border-black bg-surface p-6 flex flex-col gap-6">
          
          {/* Section B: Max File Size */}
          <div>
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
          </div>

          {/* Section C: Dimensions */}
          <div className="border-t-2 border-black pt-6">
            <p className="font-mono text-muted text-xs uppercase tracking-widest mb-4">
              RESIZE OPTIONS (PX)
            </p>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs font-mono text-muted mb-1 block">Width</label>
                <NeoInput 
                  type="number" 
                  value={width} 
                  onChange={(e) => setWidth(e.target.value)} 
                  placeholder="Auto"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-mono text-muted mb-1 block">Height</label>
                <NeoInput 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)} 
                  placeholder="Auto"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={() => setIsSmartCrop(!isSmartCrop)}
                className="w-5 h-5 border-2 border-black bg-surface flex items-center justify-center focus:outline-none"
              >
                {isSmartCrop && <div className="w-2.5 h-2.5 bg-primary" />}
              </button>
              <label className="text-sm font-mono text-text-base cursor-pointer" onClick={() => setIsSmartCrop(!isSmartCrop)}>
                Smart Crop (Fill exact dimensions)
              </label>
            </div>

            {isSmartCrop && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setCropAnchor('center')}
                  className={cn("text-xs font-mono px-2 py-1 border-2 border-black", cropAnchor === 'center' ? 'bg-primary text-black' : 'bg-surface text-muted')}
                >
                  Center
                </button>
                <button 
                  onClick={() => setCropAnchor('top')}
                  className={cn("text-xs font-mono px-2 py-1 border-2 border-black", cropAnchor === 'top' ? 'bg-primary text-black' : 'bg-surface text-muted')}
                >
                  Top
                </button>
                <button 
                  onClick={() => setCropAnchor('entropy')}
                  className={cn("text-xs font-mono px-2 py-1 border-2 border-black", cropAnchor === 'entropy' ? 'bg-primary text-black' : 'bg-surface text-muted')}
                >
                  Face-aware
                </button>
              </div>
            )}
          </div>

          <NeoButton
            variant="success"
            className="w-full mt-2 text-lg py-3"
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
- `src/components/controls/ControlsPanel.tsx` is updated
- The form appends `width`, `height`, and `crop` to `FormData`
- The UI features Width/Height inputs using `NeoInput`
- The UI features a Smart Crop checkbox replacement (Neo-brutalist style)
- The UI reveals crop anchor options (`Center`, `Top`, `Face-aware`) when Smart Crop is active
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - ControlsPanel allows user to set Width and Height inputs
  - ControlsPanel allows toggling Smart Crop with anchor points
  - Submitting appends the values to the FormData appropriately
  - npm run build passes with 0 errors
```
