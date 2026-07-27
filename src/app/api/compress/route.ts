import { NextResponse } from 'next/server'
import { compressToSize } from '@/lib/compress'
import heicConvert from 'heic-convert'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// CORS headers — allow Chrome extension and any origin to call this API
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
}

// Handle CORS preflight (OPTIONS) request from extension
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetSizeKB = Number(formData.get('targetSizeKB'))

    // Extra parameters
    const widthRaw = formData.get('width')
    const heightRaw = formData.get('height')
    const crop = formData.get('crop') as 'center' | 'top' | 'entropy' | null
    const rotationRaw = formData.get('rotation')
    const watermarkText = formData.get('watermarkText') as string | null
    const outputFormat = (formData.get('format') as 'jpeg' | 'webp' | 'png' | 'avif' | 'tiff' | 'pdf') || 'jpeg'

    const width = widthRaw ? Number(widthRaw) : undefined
    const height = heightRaw ? Number(heightRaw) : undefined
    const rotation = rotationRaw ? Number(rotationRaw) : undefined

    if (!file || !targetSizeKB) {
      return NextResponse.json(
        { error: 'Missing file or targetSizeKB' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    let buffer = Buffer.from(await file.arrayBuffer())
    const targetSizeBytes = targetSizeKB * 1024

    // Pre-process HEIC if necessary
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic'
    if (isHeic) {
      const decodedBuffer = await heicConvert({
        buffer: buffer as unknown as Parameters<typeof heicConvert>[0]['buffer'],
        format: 'JPEG',
        quality: 1,
      })
      buffer = Buffer.from(decodedBuffer)
    }

    const result = await compressToSize({
      buffer,
      targetSizeBytes,
      format: outputFormat,
      width,
      height,
      rotation,
      watermarkText: watermarkText || undefined,
      ...(crop ? { crop } : {}),
    })

    const mimeTypes: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      tiff: 'image/tiff',
      pdf: 'application/pdf',
    }

    const mimeType = mimeTypes[outputFormat] || 'image/jpeg'
    const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'document'

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
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
    return NextResponse.json(
      { error: 'Compression failed' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
