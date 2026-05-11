import sharp from 'sharp'

interface CompressOptions {
  buffer: Buffer
  targetSizeBytes: number
  format?: 'jpeg' | 'webp' | 'png' | 'avif' | 'tiff' // Format from sharp
  width?: number
  height?: number
  crop?: 'center' | 'top' | 'entropy'
}

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

  // Binary search for optimal quality
  while (minQ <= maxQ && iteration < maxIterations) {
    quality = Math.floor((minQ + maxQ) / 2)
    outBuffer = await sharp(baseBuffer)[format]({ quality }).toBuffer()
    
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
    outBuffer = await sharp(baseBuffer)[format]({ quality }).toBuffer()
    return { buffer: outBuffer, quality, hitFloor: true }
  }

  return { buffer: lastValidBuffer, quality: maxQ, hitFloor: false }
}
