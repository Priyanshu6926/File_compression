---
plan: "5.2"
phase: 5
wave: 2
title: "Loading States, Error Boundaries & Animations"
depends_on: ["5.1"]
requirements_addressed: [UI-POLISH-2, UI-POLISH-3, UI-POLISH-5]
files_modified:
  - src/components/controls/ControlsPanel.tsx
  - src/components/upload/UploadZone.tsx
  - src/app/error.tsx
autonomous: true
---

# Plan 5.2 — Loading States, Error Boundaries & Animations

## Objective

Enhance the application's perceived performance and error resilience by adding visual loading indicators, micro-animations for interactivity, and catching unhandled errors cleanly.

## Tasks

<task id="5.2.1">
<title>Add loading indicators and micro-animations to ControlsPanel</title>
<read_first>
- src/components/controls/ControlsPanel.tsx
</read_first>
<action>
Update `src/components/controls/ControlsPanel.tsx` to include an animated loading state on the NeoButton when `isProcessing` is true.

- Change the button text/icon when processing to include a simple CSS spinner or pulse effect.
- Animate the download button with a subtle pulse.
- Improve error messaging instead of just `alert()`. Set a local `error` state and render it in a Neo-Brutalist error box.

```tsx
// Inside ControlsPanel.tsx
const [error, setError] = useState<string | null>(null)

const handleCompress = async () => {
  // ...
  setError(null)
  try {
    // ...
  } catch (err: any) {
    console.error(err)
    setError(err.message || 'Compression failed. Please try again.')
  }
}

// In the render:
{error && (
  <div className="border-2 border-black bg-error p-4 shadow-neo-sm mb-6">
    <h4 className="font-black text-black uppercase text-sm mb-1">Error</h4>
    <p className="font-mono text-black text-xs">{error}</p>
  </div>
)}

// Inside NeoButton for submit:
<NeoButton
  variant="success"
  className="w-full mt-2 text-lg py-3 relative overflow-hidden"
  onClick={handleCompress}
  disabled={!file || isProcessing}
>
  {isProcessing ? (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
      PROCESSING...
    </span>
  ) : (
    '⚡ CONVERT & COMPRESS'
  )}
</NeoButton>
```
</action>
<acceptance_criteria>
- Errors are displayed in a styled alert box rather than a native browser alert.
- The submit button shows a spinning loader when `isProcessing` is true.
</acceptance_criteria>
</task>

<task id="5.2.2">
<title>Enhance UploadZone micro-animations</title>
<read_first>
- src/components/upload/UploadZone.tsx
</read_first>
<action>
Add subtle animations to the `UploadZone` to make it feel more dynamic when hovering or dragging.

```tsx
// Inside UploadZone.tsx, update the outer container class:
className={cn(
  "relative w-full aspect-video min-h-[300px] border-4 border-dashed transition-all duration-300 ease-out flex flex-col items-center justify-center p-8 text-center cursor-pointer group",
  isDragActive 
    ? "border-primary bg-primary/10 scale-[1.02] shadow-neo-primary" 
    : "border-black bg-surface hover:bg-surface-alt hover:shadow-neo-sm hover:-translate-y-1 hover:-translate-x-1"
)}

// Update the icon to add a bounce effect on hover:
<div className="w-20 h-20 mb-6 bg-base border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] group-hover:-translate-y-2 group-hover:shadow-[4px_8px_0px_0px_#000] transition-all duration-300">
  <span className="text-4xl">📸</span>
</div>
```
</action>
<acceptance_criteria>
- The upload zone physically lifts up (`-translate`) with an increased shadow on hover.
- The inner icon pops up slightly more on hover.
</acceptance_criteria>
</task>

<task id="5.2.3">
<title>Global Error Boundary</title>
<read_first>
- src/app/error.tsx
</read_first>
<action>
Create `src/app/error.tsx` to catch unexpected application-level errors.

```tsx
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
        <NeoButton variant="primary" className="w-full" onClick={() => reset()}>
          TRY AGAIN
        </NeoButton>
      </div>
    </div>
  )
}
```
</action>
<acceptance_criteria>
- `src/app/error.tsx` is created.
- The UI matches the Neo-Brutalist design language.
- Clicking "TRY AGAIN" triggers the Next.js `reset()` function.
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - Error boundary handles root errors gracefully.
  - Upload zone interactions feel alive.
  - Controls panel shows in-line errors instead of alerts.
```
