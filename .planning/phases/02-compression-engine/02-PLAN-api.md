---
plan: "2.1"
phase: 2
wave: 1
title: "Compression API Route & Recursive Sharp Engine"
depends_on: ["1.4"]
requirements_addressed: [COMP-01, COMP-02, COMP-03]
files_modified:
  - src/app/api/compress/route.ts
  - src/lib/compress.ts
autonomous: true
---

# Plan 2.1 — Compression API Route & Recursive Sharp Engine

## Objective

Build the core compression engine on the backend using Sharp. Implement a recursive binary-search compression loop to hit exact target file sizes, respecting a minimum quality floor. Expose this via a Next.js App Router API endpoint.

## Tasks

<task id="2.1.1">
<title>Implement recursive compression algorithm in src/lib/compress.ts</title>
<read_first>
- src/app/api/compress/route.ts (if exists, otherwise package.json to verify sharp)
</read_first>
<action>
Create `src/lib/compress.ts` containing the core Sharp compression algorithm:

```ts
import sharp from 'sharp'

interface CompressOptions {
  buffer: Buffer
  targetSizeBytes: number
  format?: 'jpeg' | 'webp' | 'png' | 'avif' | 'tiff' // Format from sharp
}

export async function compressToSize({ buffer, targetSizeBytes, format = 'jpeg' }: CompressOptions) {
  let minQ = 10
  let maxQ = 100
  let quality = 80
  let lastValidBuffer: Buffer | null = null
  let iteration = 0
  const maxIterations = 10
  
  // Try baseline quality first
  let outBuffer = await sharp(buffer)[format]({ quality }).toBuffer()

  if (outBuffer.byteLength <= targetSizeBytes) {
    return { buffer: outBuffer, quality, hitFloor: false }
  }

  // Binary search for optimal quality
  while (minQ <= maxQ && iteration < maxIterations) {
    quality = Math.floor((minQ + maxQ) / 2)
    outBuffer = await sharp(buffer)[format]({ quality }).toBuffer()
    
    if (outBuffer.byteLength <= targetSizeBytes) {
      lastValidBuffer = outBuffer
      minQ = quality + 1 // try to get better quality
    } else {
      maxQ = quality - 1 // need more compression
    }
    iteration++
  }

  // If we never found a buffer smaller than target, we hit the floor.
  // Return the lowest quality we attempted (minQ - 1 or 10)
  if (!lastValidBuffer) {
    quality = 10
    outBuffer = await sharp(buffer)[format]({ quality }).toBuffer()
    return { buffer: outBuffer, quality, hitFloor: true }
  }

  return { buffer: lastValidBuffer, quality: maxQ, hitFloor: false }
}
```
</action>
<acceptance_criteria>
- `src/lib/compress.ts` exists
- File contains `export async function compressToSize`
- File contains `import sharp from 'sharp'`
- Binary search logic (`Math.floor((minQ + maxQ) / 2)`) is present
- Minimum quality floor logic (`if (!lastValidBuffer)`) is present
</acceptance_criteria>
</task>

<task id="2.1.2">
<title>Create API endpoint in src/app/api/compress/route.ts</title>
<read_first>
- src/lib/compress.ts
</read_first>
<action>
Create `src/app/api/compress/route.ts` to handle file uploads and compress them:

```ts
import { NextResponse } from 'next/server'
import { compressToSize } from '@/lib/compress'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetSizeKB = Number(formData.get('targetSizeKB'))

    if (!file || !targetSizeKB) {
      return NextResponse.json({ error: 'Missing file or targetSizeKB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const targetSizeBytes = targetSizeKB * 1024

    const result = await compressToSize({ 
      buffer, 
      targetSizeBytes, 
      format: 'jpeg' // Hardcoded to jpeg for Phase 2, Phase 4 makes this dynamic
    })

    // Return the processed buffer
    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="compressed-${file.name}.jpg"`,
        'X-Compression-Quality': result.quality.toString(),
        'X-Hit-Floor': result.hitFloor.toString(),
        'X-Original-Size': buffer.byteLength.toString(),
        'X-New-Size': result.buffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Compression error:', error)
    return NextResponse.json({ error: 'Compression failed' }, { status: 500 })
  }
}
```
</action>
<acceptance_criteria>
- `src/app/api/compress/route.ts` exists
- File contains `export async function POST`
- File parses `targetSizeKB` from formData
- File calls `compressToSize`
- Response includes `X-Hit-Floor` and `X-New-Size` headers
- `npm run build` exits 0
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - compress.ts uses sharp to resize/compress the image buffer via binary search
  - compress.ts stops trying if quality floor (10) is reached
  - api/compress/route.ts exists and responds to POST requests
  - api/compress/route.ts returns image buffer with custom X-Hit-Floor header
  - npm run build passes with 0 errors
```
