// Regenerates PNG icons in public/icons (requires `sharp`: npm i -D sharp).
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const HANDSET =
  'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'

const svg = (size, glyph) => {
  const s = (size * glyph) / 24
  const o = (size - 24 * s) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6be585"/><stop offset="1" stop-color="#1fbf45"/></linearGradient></defs>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
  <g transform="translate(${o} ${o}) scale(${s})"><path d="${HANDSET}" fill="#fff"/></g></svg>`
}

mkdirSync('public/icons', { recursive: true })
const jobs = [
  ['apple-touch-icon.png', 180, 0.58],
  ['icon-192.png', 192, 0.58],
  ['icon-512.png', 512, 0.58],
  ['icon-maskable-512.png', 512, 0.42],
]
for (const [name, size, glyph] of jobs) {
  await sharp(Buffer.from(svg(size, glyph))).png().toFile(`public/icons/${name}`)
}
console.log('icons generated')
