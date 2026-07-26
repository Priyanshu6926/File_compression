// Run: node generate-icons.js
// Generates PicSize Pro extension icons at 16, 32, 48, 128px

const sharp = require('sharp')
const path  = require('path')
const fs    = require('fs')

const outDir = path.join(__dirname, 'icons')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

async function makeIcon(size) {
  const pad    = Math.max(2, Math.floor(size * 0.08))
  const border = Math.max(1, Math.floor(size * 0.06))
  const fontSize  = Math.floor(size * 0.44)
  const shadowOff = Math.max(1, Math.floor(size * 0.06))

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="${size}" height="${size}" fill="#1a1110"/>
    <!-- Yellow border rectangle (neo-brutalist frame) -->
    <rect x="${pad}" y="${pad}"
          width="${size - pad * 2}" height="${size - pad * 2}"
          fill="none" stroke="#f5d547" stroke-width="${border}"/>
    <!-- Shadow offset rectangle -->
    <rect x="${pad + shadowOff}" y="${pad + shadowOff}"
          width="${size - pad * 2}" height="${size - pad * 2}"
          fill="none" stroke="#000" stroke-width="${Math.max(1, Math.floor(border * 0.5))}"/>
    <!-- Letter P -->
    <text x="${size / 2}" y="${size * 0.68}"
          text-anchor="middle"
          fill="#f5d547"
          font-weight="900"
          font-size="${fontSize}"
          font-family="'Courier New', Courier, monospace"
          letter-spacing="-1">P</text>
  </svg>`

  const outPath = path.join(outDir, `icon${size}.png`)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  console.log(`✅ Generated icon${size}.png`)
}

async function main() {
  for (const size of [16, 32, 48, 128]) {
    await makeIcon(size)
  }
  console.log('\n🎉 All icons generated in extension/icons/')
}

main().catch(console.error)
