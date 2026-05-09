---
plan: "3.1"
phase: 3
wave: 1
title: "Resize Engine Integration"
depends_on: ["2.2"]
requirements_addressed: [RSZR-02, RSZR-03, RSZR-04]
files_modified:
  - src/lib/compress.ts
  - src/app/api/compress/route.ts
autonomous: true
---

# Plan 3.1 — Resize Engine Integration

## Objective

Enhance the backend processing engine (`src/lib/compress.ts`) and the API route to support dimensions control. Implement aspect-ratio-preserving resize (`fit: inside`) and smart crop (`fit: cover` with configurable crop anchor) using Sharp.

## Tasks

<task id="3.1.1">
<title>Update compressToSize to support dimensions and crop modes</title>
<read_first>
- src/lib/compress.ts
</read_first>
<action>
Modify `CompressOptions` and `compressToSize` in `src/lib/compress.ts` to accept `width`, `height`, and `crop` options.

Update the interface:
```ts
interface CompressOptions {
  buffer: Buffer
  targetSizeBytes: number
  format?: 'jpeg' | 'webp' | 'png' | 'avif' | 'tiff'
  width?: number
  height?: number
  crop?: 'center' | 'top' | 'entropy'
}
```

In `compressToSize`, before the binary search loop, create a resized buffer. Since resizing affects file size, we must resize first, then compress.

Modify the function to first create a base Sharp instance with resizing applied:
```ts
export async function compressToSize({ buffer, targetSizeBytes, format = 'jpeg', width, height, crop }: CompressOptions) {
  let minQ = 10
  let maxQ = 100
  let quality = 80
  let lastValidBuffer: Buffer | null = null
  let iteration = 0
  const maxIterations = 10

  // 1. Initial Processing (Resize + format)
  let processor = sharp(buffer)
  
  if (width || height) {
    if (crop) {
      let position = sharp.strategy.entropy
      if (crop === 'center') position = sharp.gravity.center
      if (crop === 'top') position = sharp.gravity.north
      
      processor = processor.resize({
        width,
        height,
        fit: 'cover',
        position
      })
    } else {
      processor = processor.resize({
        width,
        height,
        fit: 'inside',
        withoutEnlargement: true
      })
    }
  }

  // Generate a base buffer that represents the resized image (lossless or high-quality)
  const baseBuffer = await processor.toBuffer()

  // 2. Binary search for optimal quality using the resized baseBuffer
  let outBuffer = await sharp(baseBuffer)[format]({ quality }).toBuffer()

  if (outBuffer.byteLength <= targetSizeBytes) {
    return { buffer: outBuffer, quality, hitFloor: false }
  }

  while (minQ <= maxQ && iteration < maxIterations) {
    quality = Math.floor((minQ + maxQ) / 2)
    outBuffer = await sharp(baseBuffer)[format]({ quality }).toBuffer()
    
    if (outBuffer.byteLength <= targetSizeBytes) {
      lastValidBuffer = outBuffer
      minQ = quality + 1
    } else {
      maxQ = quality - 1
    }
    iteration++
  }

  if (!lastValidBuffer) {
    quality = 10
    outBuffer = await sharp(baseBuffer)[format]({ quality }).toBuffer()
    return { buffer: outBuffer, quality, hitFloor: true }
  }

  return { buffer: lastValidBuffer, quality: maxQ, hitFloor: false }
}
```
</action>
<acceptance_criteria>
- `src/lib/compress.ts` includes `width`, `height`, `crop` in `CompressOptions`
- The `processor.resize` is called with `fit: 'cover'` if `crop` is truthy
- The `processor.resize` is called with `fit: 'inside'` if `crop` is falsy
- Smart crop supports `entropy` for face/feature-aware cropping
</acceptance_criteria>
</task>

<task id="3.1.2">
<title>Update POST /api/compress route to accept resize parameters</title>
<read_first>
- src/app/api/compress/route.ts
- src/lib/compress.ts
</read_first>
<action>
Modify `src/app/api/compress/route.ts` to extract the new form data fields (`width`, `height`, `crop`) and pass them to `compressToSize`.

```ts
import { NextResponse } from 'next/server'
import { compressToSize } from '@/lib/compress'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetSizeKB = Number(formData.get('targetSizeKB'))
    
    // New resize parameters
    const widthRaw = formData.get('width')
    const heightRaw = formData.get('height')
    const crop = formData.get('crop') as 'center' | 'top' | 'entropy' | null

    const width = widthRaw ? Number(widthRaw) : undefined
    const height = heightRaw ? Number(heightRaw) : undefined

    if (!file || !targetSizeKB) {
      return NextResponse.json({ error: 'Missing file or targetSizeKB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const targetSizeBytes = targetSizeKB * 1024

    const result = await compressToSize({ 
      buffer, 
      targetSizeBytes, 
      format: 'jpeg',
      width,
      height,
      ...(crop ? { crop } : {})
    })

    return new NextResponse(new Uint8Array(result.buffer), {
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
- `src/app/api/compress/route.ts` extracts `width`, `height`, and `crop` from `formData`
- Passes parsed parameters to `compressToSize`
- Handles undefined values correctly if dimensions aren't provided
- `npm run build` exits 0
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - compress.ts uses sharp.resize() before the binary compression loop
  - smart crop is available via sharp.strategy.entropy or gravity
  - api/compress/route.ts safely parses width, height, and crop parameters
  - npm run build passes with 0 errors
```
