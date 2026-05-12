---
plan: "4.1"
phase: 4
wave: 1
title: "Format Conversion & HEIC Decode API"
depends_on: ["3.1"]
requirements_addressed: [CONV-01, CONV-02, CONV-03]
files_modified:
  - src/lib/compress.ts
  - src/app/api/compress/route.ts
autonomous: true
---

# Plan 4.1 — Format Conversion & HEIC Decode API

## Objective

Enhance the `compressToSize` engine and API route to support dynamic output formats (JPEG, PNG, WEBP, AVIF, TIFF) and integrate `heic-convert` to preprocess HEIC images before passing them to Sharp.

## Tasks

<task id="4.1.1">
<title>Integrate heic-convert and dynamic formats in compressToSize</title>
<read_first>
- src/lib/compress.ts
- src/app/api/compress/route.ts
</read_first>
<action>
Update `src/app/api/compress/route.ts` to accept an `outputFormat` and handle HEIC pre-processing. `heic-convert` must be imported and used if the file is a HEIC image.

In `src/app/api/compress/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { compressToSize } from '@/lib/compress'
import heicConvert from 'heic-convert'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetSizeKB = Number(formData.get('targetSizeKB'))
    
    const widthRaw = formData.get('width')
    const heightRaw = formData.get('height')
    const crop = formData.get('crop') as 'center' | 'top' | 'entropy' | null
    const outputFormat = (formData.get('format') as 'jpeg' | 'webp' | 'png' | 'avif' | 'tiff') || 'jpeg'

    const width = widthRaw ? Number(widthRaw) : undefined
    const height = heightRaw ? Number(heightRaw) : undefined

    if (!file || !targetSizeKB) {
      return NextResponse.json({ error: 'Missing file or targetSizeKB' }, { status: 400 })
    }

    let buffer = Buffer.from(await file.arrayBuffer())
    const targetSizeBytes = targetSizeKB * 1024

    // 1. Pre-process HEIC if necessary
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic'
    if (isHeic) {
      buffer = Buffer.from(await heicConvert({
        buffer,
        format: 'JPEG',
        quality: 1 // high quality decode before compression
      }))
    }
    
    // Note: RAW processing (CR2/NEF/ARW) relies on Sharp's underlying libvips compilation.
    // If libvips was compiled with magick/libraw, Sharp will handle it natively.
    // Otherwise, we gracefully pass it to Sharp and it may throw an unsupported format error.

    const result = await compressToSize({ 
      buffer, 
      targetSizeBytes, 
      format: outputFormat,
      width,
      height,
      ...(crop ? { crop } : {})
    })

    const mimeTypes: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      tiff: 'image/tiff'
    }

    const mimeType = mimeTypes[outputFormat] || 'image/jpeg'
    const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat
    // preserve original name without old extension
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image'

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="compressed-${baseName}.${extension}"`,
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

Verify that `heic-convert` is used properly. Wait, `heicConvert` returns a Promise resolving to an ArrayBuffer/Buffer. The type might need to be cast or wrapped in `Buffer.from()`.
</action>
<acceptance_criteria>
- The API route extracts the `format` field from `FormData`
- The API intercepts `.heic` and `image/heic` files and decodes them via `heic-convert` to JPEG before passing to Sharp
- The API returns the correct `Content-Type` and `Content-Disposition` (extension) corresponding to the `outputFormat`
- The API passes `outputFormat` to `compressToSize`
- `compressToSize` correctly uses `format` in `sharp(baseBuffer)[format]({ quality })`
- Build passes without type errors
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - heic-convert correctly preprocesses HEIC input
  - dynamic format parameter is safely passed to Sharp
  - API returns appropriate filename extension in Content-Disposition
  - npm run build passes with 0 errors
```
