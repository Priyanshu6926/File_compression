---
plan: "1.4"
phase: 1
wave: 2
title: "Build MetadataPanel and Wire Full Upload Flow"
depends_on: ["1.3"]
requirements_addressed: [UPLD-03, UPLD-04]
files_modified:
  - src/components/upload/MetadataPanel.tsx
  - src/app/page.tsx
autonomous: true
---

# Plan 1.4 — Build MetadataPanel and Wire Full Upload Flow

## Objective

Implement the `MetadataPanel` component that displays file metadata (format, dimensions, size) after upload. Update `page.tsx` to wire the full upload flow: file uploaded → preview shown → metadata panel appears below. Satisfies UPLD-03 (preview) and UPLD-04 (metadata display).

## Tasks

<task id="1.4.1">
<title>Build MetadataPanel component</title>
<read_first>
- src/context/ProcessingContext.tsx (FileMetadata interface — name, format, mimeType, width, height, sizeBytes, sizeMB)
- src/lib/metadata.ts (formatBytes function)
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 6.3 MetadataPanel spec)
</read_first>
<action>
Create `src/components/upload/MetadataPanel.tsx`:

```tsx
'use client'

import { useProcessing } from '@/context/ProcessingContext'
import { formatBytes } from '@/lib/metadata'

export function MetadataPanel() {
  const { fileMetadata, clearFile } = useProcessing()

  if (!fileMetadata) return null

  const rows: { label: string; value: string }[] = [
    { label: 'FILENAME',   value: fileMetadata.name },
    { label: 'FORMAT',     value: `${fileMetadata.format} (${fileMetadata.mimeType || 'unknown'})` },
    {
      label: 'DIMENSIONS',
      value: fileMetadata.width > 0
        ? `${fileMetadata.width} × ${fileMetadata.height} px`
        : 'Requires server decode',
    },
    { label: 'FILE SIZE',  value: `${fileMetadata.sizeMB} (${fileMetadata.sizeBytes.toLocaleString()} B)` },
  ]

  return (
    <div
      className="border-2 border-black bg-surface"
      role="region"
      aria-label="Uploaded file information"
    >
      {/* Header */}
      <div className="bg-primary border-b-2 border-black px-4 py-2 flex items-center justify-between">
        <h2 className="font-black text-base text-sm uppercase tracking-tight">
          FILE INFORMATION
        </h2>
        <button
          onClick={clearFile}
          className="font-mono text-base text-xs border border-black px-2 py-0.5 hover:bg-base hover:text-primary transition-colors"
          aria-label="Clear uploaded file"
        >
          [×]
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y-2 divide-black">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-start gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-alt'}`}
          >
            <span className="font-mono text-muted text-xs uppercase tracking-widest w-28 shrink-0 pt-0.5">
              {row.label}
            </span>
            <span className="font-mono text-text-base text-sm break-all">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```
</action>
<acceptance_criteria>
- `src/components/upload/MetadataPanel.tsx` exists
- File contains `export function MetadataPanel(`
- File contains `useProcessing()`
- File contains `role="region"`
- File contains `aria-label="Uploaded file information"`
- File contains `FILE INFORMATION`
- File contains `FILENAME` and `FORMAT` and `DIMENSIONS` and `FILE SIZE` as labels
- File returns null when `fileMetadata` is null
- `npm run build` exits 0
</acceptance_criteria>
</task>

<task id="1.4.2">
<title>Update page.tsx to render MetadataPanel and wire full upload flow</title>
<read_first>
- src/app/page.tsx (current — has TrustHeader and UploadZone placeholder layout)
- src/components/upload/MetadataPanel.tsx (just created)
- src/context/ProcessingContext.tsx (file and fileMetadata state)
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 4 Layout)
</read_first>
<action>
Replace `src/app/page.tsx` with the complete wired layout:

```tsx
import { TrustHeader } from '@/components/layout/TrustHeader'
import { UploadZone } from '@/components/upload/UploadZone'
import { MetadataPanel } from '@/components/upload/MetadataPanel'

export default function Home() {
  return (
    <main className="min-h-screen bg-base flex flex-col">
      <TrustHeader />

      <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 pt-[76px] pb-12">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-black text-text-base text-4xl uppercase tracking-tight leading-none">
            TRANSFORM ANY IMAGE
          </h1>
          <p className="font-mono text-muted text-sm mt-2">
            Upload · Convert · Compress · Download — hit exact size and format requirements
          </p>
        </div>

        {/* Main grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* LEFT: Upload + Metadata (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6">
            <UploadZone />
            <MetadataPanel />
          </div>

          {/* RIGHT: Controls Panel (40%) — placeholder until Phase 2 */}
          <div className="w-full lg:w-[40%] flex flex-col gap-6">
            <div className="neo-card">
              <div className="border-2 border-black bg-surface p-6">
                <p className="font-mono text-muted text-xs uppercase tracking-widest mb-4">
                  CONVERSION CONTROLS
                </p>
                <p className="font-mono text-muted text-xs">
                  Target format, compression, and resize options — Phase 2
                </p>
              </div>
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
- `src/app/page.tsx` contains `import { MetadataPanel }`
- `src/app/page.tsx` contains `<MetadataPanel />`
- `src/app/page.tsx` contains `TRANSFORM ANY IMAGE`
- `src/app/page.tsx` contains `lg:w-[60%]` and `lg:w-[40%]`
- `src/app/page.tsx` contains `CONVERSION CONTROLS`
- `npm run build` exits 0
</acceptance_criteria>
</task>

<task id="1.4.3">
<title>Final build and smoke test</title>
<read_first>
- package.json (verify all dependencies present)
- src/app/layout.tsx (verify ProcessingProvider is wrapping children)
</read_first>
<action>
Run the following to confirm the full Phase 1 implementation is clean:

```bash
# TypeScript check
npx tsc --noEmit

# ESLint check
npx next lint

# Production build
npm run build
```

If TypeScript errors appear in `src/components/upload/UploadZone.tsx` related to the `catch` block, fix by typing the error:
```ts
} catch (err: unknown) {
  console.error('Metadata extraction failed:', err)
  setState('error')
  setError('Could not read file. Please try another image.')
}
```

Commit Phase 1 completion:
```bash
git add -A
git commit -m "feat(phase-1): scaffold, upload zone, trust header, metadata panel"
```
</action>
<acceptance_criteria>
- `npx tsc --noEmit` exits 0 (no TypeScript errors)
- `npm run build` exits 0 (no build errors)
- `git log --oneline -1` shows commit message starting with `feat(phase-1):`
- `src/components/layout/TrustHeader.tsx` exists
- `src/components/upload/UploadZone.tsx` exists
- `src/components/upload/MetadataPanel.tsx` exists
- `src/context/ProcessingContext.tsx` exists
- `src/lib/metadata.ts` exists
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - MetadataPanel shows FILENAME, FORMAT, DIMENSIONS, FILE SIZE rows
  - MetadataPanel returns null when no file is uploaded
  - Uploading a valid PNG/JPG shows preview and metadata panel
  - Uploading an invalid file shows error message with role="alert"
  - Privacy Mode toggle in TrustHeader switches LED color and button label
  - page.tsx renders the complete 60/40 layout with all components
  - npx tsc --noEmit exits 0
  - npm run build exits 0
  - Phase 1 changes committed as feat(phase-1): ...
```
