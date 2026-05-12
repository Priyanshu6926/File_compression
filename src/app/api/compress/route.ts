import { NextResponse } from 'next/server'
import { compressToSize } from '@/lib/compress'
import heicConvert from 'heic-convert'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetSizeKB = Number(formData.get('targetSizeKB'))
    
    // New resize parameters
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
      const decodedBuffer = await heicConvert({
        buffer: buffer as any,
        format: 'JPEG',
        quality: 1 // high quality decode before compression
      });
      buffer = Buffer.from(decodedBuffer);
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
