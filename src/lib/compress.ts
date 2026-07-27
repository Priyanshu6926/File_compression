import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'

interface CompressOptions {
  buffer: Buffer
  targetSizeBytes: number
  format?: 'jpeg' | 'webp' | 'png' | 'avif' | 'tiff' | 'pdf'
  width?: number
  height?: number
  crop?: 'center' | 'top' | 'entropy'
  rotation?: number
  watermarkText?: string
}

export async function compressToSize({
  buffer,
  targetSizeBytes,
  format = 'jpeg',
  width,
  height,
  crop,
  rotation,
  watermarkText,
}: CompressOptions) {
  let minQ = 10
  let maxQ = 100
  let quality = 80
  let lastValidBuffer: Buffer | null = null
  let iteration = 0
  const maxIterations = 10

  // 1. Initial Processing (Rotation, Resize, Watermark)
  let processor = sharp(buffer)

  // Apply rotation
  if (rotation && [90, 180, 270].includes(rotation)) {
    processor = processor.rotate(rotation)
  }

  // Apply resize
  if (width || height) {
    if (crop) {
      let position = sharp.strategy.entropy
      if (crop === 'center') position = sharp.gravity.center
      if (crop === 'top') position = sharp.gravity.north

      processor = processor.resize({
        width,
        height,
        fit: 'cover',
        position,
      })
    } else {
      processor = processor.resize({
        width,
        height,
        fit: 'inside',
        withoutEnlargement: true,
      })
    }
  }

  // Apply Watermark overlay if provided
  if (watermarkText && watermarkText.trim().length > 0) {
    const cleanText = watermarkText.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const svgWatermark = `
      <svg width="400" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="80" fill="rgba(0,0,0,0.4)" rx="6"/>
        <text x="200" y="48" font-size="22" font-weight="bold" font-family="monospace" fill="#ffffff" text-anchor="middle">
          ${cleanText}
        </text>
      </svg>
    `
    processor = processor.composite([
      {
        input: Buffer.from(svgWatermark),
        gravity: 'southeast',
      },
    ])
  }

  // Generate baseBuffer representing pre-processed image
  const baseBuffer = await processor.toBuffer()

  // Handle PDF format conversion
  if (format === 'pdf') {
    // Generate JPEG buffer first
    const jpgBuf = await sharp(baseBuffer).jpeg({ quality: 85 }).toBuffer()
    const pdfDoc = await PDFDocument.create()
    const image = await pdfDoc.embedJpg(jpgBuf)
    const page = pdfDoc.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
    const pdfBytes = await pdfDoc.save()
    return { buffer: Buffer.from(pdfBytes), quality: 85, hitFloor: false }
  }

  // 2. Binary search for optimal quality
  const targetFormat = format as 'jpeg' | 'webp' | 'png' | 'avif' | 'tiff'
  let outBuffer = await sharp(baseBuffer)[targetFormat]({ quality }).toBuffer()

  if (outBuffer.byteLength <= targetSizeBytes) {
    return { buffer: outBuffer, quality, hitFloor: false }
  }

  while (minQ <= maxQ && iteration < maxIterations) {
    quality = Math.floor((minQ + maxQ) / 2)
    outBuffer = await sharp(baseBuffer)[targetFormat]({ quality }).toBuffer()

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
    outBuffer = await sharp(baseBuffer)[targetFormat]({ quality }).toBuffer()
    return { buffer: outBuffer, quality, hitFloor: true }
  }

  return { buffer: lastValidBuffer, quality: maxQ, hitFloor: false }
}
