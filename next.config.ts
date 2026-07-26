import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp', 'heic-convert'],

  // Allow WASM from @imgly/background-removal CDN
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ]
  },

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {
    // WASM support is built-in to Turbopack — no extra config needed
  },
}

export default nextConfig
