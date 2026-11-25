// Regenerates PNG icons in public/icons from the Phone app icon (requires `sharp`: npm i -D sharp).
//   scripts/assets/phone-ios.png            – original rounded icon ("any" purpose)
//   scripts/assets/phone-ios-fullbleed.png  – same artwork without rounded corners (apple-touch-icon)
//   scripts/assets/phone-ios-maskable.png   – full-bleed background + smaller handset (maskable safe zone)
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })
const jobs = [
  ['apple-touch-icon.png', 'scripts/assets/phone-ios-fullbleed.png', 180],
  ['icon-192.png', 'scripts/assets/phone-ios.png', 192],
  ['icon-512.png', 'scripts/assets/phone-ios.png', 512],
  ['icon-maskable-512.png', 'scripts/assets/phone-ios-maskable.png', 512],
]
for (const [name, from, size] of jobs) {
  await sharp(from).resize(size, size).png().toFile(`public/icons/${name}`)
}
console.log('icons generated')
