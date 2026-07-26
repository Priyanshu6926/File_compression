export interface Preset {
  id: string
  name: string
  emoji: string
  category: string
  description: string
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff'
  targetSizeKB: number
  width?: number
  height?: number
  crop?: 'center' | 'top' | 'entropy'
  badge?: string
}

export const PRESETS: Preset[] = [
  // — Government / ID
  {
    id: 'passport-india',
    name: 'Passport India',
    emoji: '🇮🇳',
    category: 'Government / ID',
    description: '35×45mm · ≤50KB · JPEG',
    format: 'jpeg',
    targetSizeKB: 50,
    width: 413,   // 35mm at 300dpi
    height: 531,  // 45mm at 300dpi
    crop: 'center',
    badge: 'HOT',
  },
  {
    id: 'passport-us',
    name: 'Passport US',
    emoji: '🇺🇸',
    category: 'Government / ID',
    description: '2×2in · ≤240KB · JPEG',
    format: 'jpeg',
    targetSizeKB: 240,
    width: 600,   // 2in at 300dpi
    height: 600,
    crop: 'center',
  },
  {
    id: 'aadhar-photo',
    name: 'Aadhar / Voter ID',
    emoji: '🪪',
    category: 'Government / ID',
    description: '213×213px · ≤20KB · JPEG',
    format: 'jpeg',
    targetSizeKB: 20,
    width: 213,
    height: 213,
    crop: 'center',
    badge: 'HOT',
  },
  {
    id: 'visa-schengen',
    name: 'Schengen Visa',
    emoji: '🇪🇺',
    category: 'Government / ID',
    description: '35×45mm · ≤50KB · JPEG',
    format: 'jpeg',
    targetSizeKB: 50,
    width: 413,
    height: 531,
    crop: 'center',
  },

  // — Professional / Social
  {
    id: 'linkedin-profile',
    name: 'LinkedIn Profile',
    emoji: '💼',
    category: 'Professional / Social',
    description: '400×400px · ≤8MB · JPEG',
    format: 'jpeg',
    targetSizeKB: 8000,
    width: 400,
    height: 400,
    crop: 'center',
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    emoji: '🖼️',
    category: 'Professional / Social',
    description: '1584×396px · ≤8MB · JPEG',
    format: 'jpeg',
    targetSizeKB: 8000,
    width: 1584,
    height: 396,
    crop: 'center',
  },
  {
    id: 'twitter-header',
    name: 'Twitter / X Header',
    emoji: '🐦',
    category: 'Professional / Social',
    description: '1500×500px · ≤5MB · JPEG',
    format: 'jpeg',
    targetSizeKB: 5000,
    width: 1500,
    height: 500,
    crop: 'center',
  },
  {
    id: 'whatsapp-dp',
    name: 'WhatsApp DP',
    emoji: '💬',
    category: 'Professional / Social',
    description: '500×500px · ≤100KB · JPEG',
    format: 'jpeg',
    targetSizeKB: 100,
    width: 500,
    height: 500,
    crop: 'center',
  },

  // — E-Commerce
  {
    id: 'amazon-product',
    name: 'Amazon Product',
    emoji: '📦',
    category: 'E-Commerce',
    description: '2000×2000px · ≤10MB · JPEG',
    format: 'jpeg',
    targetSizeKB: 10000,
    width: 2000,
    height: 2000,
    crop: 'center',
    badge: 'NEW',
  },

  // — Social Media
  {
    id: 'instagram-square',
    name: 'Instagram Square',
    emoji: '📸',
    category: 'Social Media',
    description: '1080×1080px · ≤8MB · JPEG',
    format: 'jpeg',
    targetSizeKB: 8000,
    width: 1080,
    height: 1080,
    crop: 'entropy',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    emoji: '📱',
    category: 'Social Media',
    description: '1080×1920px · ≤8MB · JPEG',
    format: 'jpeg',
    targetSizeKB: 8000,
    width: 1080,
    height: 1920,
    crop: 'center',
  },

  // — Web / Dev
  {
    id: 'webp-optimized',
    name: 'Web Optimized',
    emoji: '🌐',
    category: 'Web / Dev',
    description: 'Max 1920px · ≤200KB · WEBP',
    format: 'webp',
    targetSizeKB: 200,
    width: 1920,
  },
  {
    id: 'thumbnail',
    name: 'Thumbnail',
    emoji: '🖼️',
    category: 'Web / Dev',
    description: '300×300px · ≤50KB · WEBP',
    format: 'webp',
    targetSizeKB: 50,
    width: 300,
    height: 300,
    crop: 'center',
  },
]

export const PRESET_CATEGORIES = [...new Set(PRESETS.map((p) => p.category))]
