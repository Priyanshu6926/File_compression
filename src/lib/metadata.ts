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
