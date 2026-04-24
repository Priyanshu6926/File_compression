---
plan: "1.2"
phase: 1
wave: 1
title: "Install Sharp, heic-convert, and Processing Context"
depends_on: ["1.1"]
requirements_addressed: [UPLD-02]
files_modified:
  - package.json
  - src/context/ProcessingContext.tsx
  - src/lib/metadata.ts
autonomous: true
---

# Plan 1.2 — Install Sharp, heic-convert, and Processing Context

## Objective

Install all server-side image processing dependencies (Sharp, heic-convert) and create the `ProcessingContext` for tracking Privacy Mode state and uploaded file state across components.

## Tasks

<task id="1.2.1">
<title>Install Sharp and image processing dependencies</title>
<read_first>
- package.json (current after scaffold)
</read_first>
<action>
Run from project root:

```bash
npm install sharp heic-convert
npm install --save-dev @types/sharp
```

Then configure next.config.ts to mark sharp as an external package (required for Vercel/serverless):

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'heic-convert'],
  },
}

export default nextConfig
```
</action>
<acceptance_criteria>
- `package.json` dependencies contains `"sharp"`
- `package.json` dependencies contains `"heic-convert"`
- `next.config.ts` contains `serverComponentsExternalPackages`
- `next.config.ts` contains `'sharp'`
- `npm run build` exits 0
</acceptance_criteria>
</task>

<task id="1.2.2">
<title>Create ProcessingContext for Privacy Mode and file state</title>
<read_first>
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 6.1 Trust Widget toggle behavior)
- src/app/layout.tsx
</read_first>
<action>
Create `src/context/ProcessingContext.tsx`:

```tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type ProcessingMode = 'server' | 'client'

export interface FileMetadata {
  name: string
  format: string
  mimeType: string
  width: number
  height: number
  sizeBytes: number
  sizeMB: string
}

interface ProcessingContextType {
  mode: ProcessingMode
  toggleMode: () => void
  file: File | null
  fileMetadata: FileMetadata | null
  preview: string | null
  setUploadedFile: (file: File, metadata: FileMetadata, preview: string) => void
  clearFile: () => void
}

const ProcessingContext = createContext<ProcessingContextType | null>(null)

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ProcessingMode>('server')
  const [file, setFile] = useState<File | null>(null)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const toggleMode = () =>
    setMode((prev) => (prev === 'server' ? 'client' : 'server'))

  const setUploadedFile = (f: File, metadata: FileMetadata, previewUrl: string) => {
    setFile(f)
    setFileMetadata(metadata)
    setPreview(previewUrl)
  }

  const clearFile = () => {
    setFile(null)
    setFileMetadata(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  return (
    <ProcessingContext.Provider
      value={{ mode, toggleMode, file, fileMetadata, preview, setUploadedFile, clearFile }}
    >
      {children}
    </ProcessingContext.Provider>
  )
}

export function useProcessing() {
  const ctx = useContext(ProcessingContext)
  if (!ctx) throw new Error('useProcessing must be used within ProcessingProvider')
  return ctx
}
```

Then wrap the body in layout.tsx with the provider:

```tsx
// In src/app/layout.tsx — import and wrap:
import { ProcessingProvider } from '@/context/ProcessingContext'
// ...
<body ...>
  <ProcessingProvider>
    {children}
  </ProcessingProvider>
</body>
```
</action>
<acceptance_criteria>
- `src/context/ProcessingContext.tsx` exists
- File contains `export type ProcessingMode = 'server' | 'client'`
- File contains `export function useProcessing()`
- File contains `export function ProcessingProvider(`
- `src/app/layout.tsx` contains `ProcessingProvider`
- `npm run build` exits 0
</acceptance_criteria>
</task>

<task id="1.2.3">
<title>Create client-side metadata extraction utility</title>
<read_first>
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 6.2 Upload Zone metadata display)
- src/context/ProcessingContext.tsx (FileMetadata interface)
</read_first>
<action>
Create `src/lib/metadata.ts`:

```ts
import type { FileMetadata } from '@/context/ProcessingContext'

// Supported MIME types and their display labels
export const SUPPORTED_FORMATS: Record<string, string> = {
  'image/jpeg':    'JPEG',
  'image/jpg':     'JPEG',
  'image/png':     'PNG',
  'image/webp':    'WEBP',
  'image/avif':    'AVIF',
  'image/tiff':    'TIFF',
  'image/svg+xml': 'SVG',
  'image/heic':    'HEIC',
  'image/heif':    'HEIF',
  // RAW formats (browser may not report these — handle by extension)
  'image/x-canon-cr2':  'RAW (CR2)',
  'image/x-nikon-nef':  'RAW (NEF)',
  'image/x-sony-arw':   'RAW (ARW)',
}

// Derive format from file extension when MIME is generic
const RAW_EXTENSIONS: Record<string, string> = {
  cr2: 'RAW (CR2)',
  nef: 'RAW (NEF)',
  arw: 'RAW (ARW)',
  dng: 'RAW (DNG)',
  raf: 'RAW (RAF)',
  rw2: 'RAW (RW2)',
}

export function getDisplayFormat(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (RAW_EXTENSIONS[ext]) return RAW_EXTENSIONS[ext]
  return SUPPORTED_FORMATS[file.type] ?? file.type.split('/')[1]?.toUpperCase() ?? 'UNKNOWN'
}

export function isFormatSupported(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return (
    file.type in SUPPORTED_FORMATS ||
    ext in RAW_EXTENSIONS ||
    ['heic', 'heif'].includes(ext)
  )
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// Extract pixel dimensions from a File object using an Image element
export async function extractImageMetadata(file: File): Promise<FileMetadata> {
  const format = getDisplayFormat(file)
  const sizeMB = formatBytes(file.size)

  // For formats the browser can decode natively, use Image element
  const nativeFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif']
  if (nativeFormats.includes(file.type)) {
    const { width, height } = await getImageDimensions(file)
    return { name: file.name, format, mimeType: file.type, width, height, sizeBytes: file.size, sizeMB }
  }

  // For HEIC/RAW, dimensions require server decode — return 0×0 as placeholder
  return { name: file.name, format, mimeType: file.type, width: 0, height: 0, sizeBytes: file.size, sizeMB }
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image for dimension extraction'))
    }
    img.src = url
  })
}
```
</action>
<acceptance_criteria>
- `src/lib/metadata.ts` exists
- File contains `export const SUPPORTED_FORMATS`
- File contains `'image/heic':    'HEIC'`
- File contains `export function isFormatSupported(`
- File contains `export async function extractImageMetadata(`
- File contains `export function formatBytes(`
- `npm run build` exits 0
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - sharp and heic-convert installed in package.json
  - next.config.ts marks sharp/heic-convert as serverComponentsExternalPackages
  - ProcessingContext provides mode, toggleMode, file, fileMetadata, preview
  - metadata.ts exports isFormatSupported, extractImageMetadata, formatBytes
  - npm run build exits 0
```
