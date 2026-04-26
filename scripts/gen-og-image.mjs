#!/usr/bin/env node
/**
 * Generate a 1200×630 og-image.png for social sharing previews.
 * Uses sharp (via npx) to render an SVG with the SEIS branding.
 * Run: node scripts/gen-og-image.mjs
 */
import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

const WIDTH = 1200
const HEIGHT = 630

// SVG with SEIS branding colors: black bg, crimson accent, gold text
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d0d0d"/>
      <stop offset="40%" stop-color="#1a0405"/>
      <stop offset="70%" stop-color="#2c0608"/>
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c6ba8e"/>
      <stop offset="100%" stop-color="#d4c99a"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <!-- Grid overlay -->
  <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
    <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(198,186,142,0.04)" stroke-width="1"/>
  </pattern>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>
  <!-- Top crimson accent bar -->
  <rect y="0" width="${WIDTH}" height="6" fill="#8b1a1a"/>
  <!-- Bottom crimson accent bar -->
  <rect y="${HEIGHT - 6}" width="${WIDTH}" height="6" fill="#8b1a1a"/>
  <!-- Main title -->
  <text x="${WIDTH/2}" y="220" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-weight="800" font-size="72" fill="white" letter-spacing="4" text-transform="uppercase">SWIMMING EAGLES</text>
  <text x="${WIDTH/2}" y="310" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-weight="800" font-size="72" fill="url(#gold)" letter-spacing="4" text-transform="uppercase">INVITATIONAL SERIES</text>
  <!-- Divider -->
  <rect x="${WIDTH/2 - 60}" y="340" width="120" height="3" fill="#8b1a1a"/>
  <!-- Subtitle -->
  <text x="${WIDTH/2}" y="400" text-anchor="middle" font-family="system-ui,Georgia,serif" font-style="italic" font-size="24" fill="rgba(198,186,142,0.6)" letter-spacing="2">Cairo American College · Hassan &amp; Webb Aquatics Center</text>
  <!-- Badges row -->
  <text x="${WIDTH/2}" y="470" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-weight="600" font-size="18" fill="rgba(198,186,142,0.5)" letter-spacing="6" text-transform="uppercase">2 DAYS · 5 AGE GROUPS · 8 LANES · 25M SCM</text>
  <!-- SEIS watermark -->
  <text x="${WIDTH/2}" y="560" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-weight="700" font-size="28" fill="rgba(198,186,142,0.15)" letter-spacing="16">S E I S</text>
</svg>`

writeFileSync('public/og-image.svg', svg)
console.log('✓ SVG written to public/og-image.svg')

// Try to convert to PNG using sharp
try {
  execSync('npx --yes sharp-cli -i public/og-image.svg -o public/og-image.png --width 1200 --height 630', { stdio: 'inherit' })
  console.log('✓ PNG written to public/og-image.png')
} catch {
  console.log('⚠ sharp-cli not available. Trying canvas fallback...')
  // Fallback: use resvg-js if available
  try {
    execSync('npx --yes @aspect-build/resvg public/og-image.svg public/og-image.png', { stdio: 'inherit' })
    console.log('✓ PNG written via resvg')
  } catch {
    console.log('⚠ Could not auto-convert to PNG.')
    console.log('  Manual conversion: open public/og-image.svg in browser, screenshot at 1200×630, save as public/og-image.png')
    console.log('  Or install: npm i -g sharp-cli && sharp -i public/og-image.svg -o public/og-image.png')
  }
}
