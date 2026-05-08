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
