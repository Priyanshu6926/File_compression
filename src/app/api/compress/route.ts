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

    // Return the processed buffer
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
