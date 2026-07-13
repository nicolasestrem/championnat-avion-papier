// One-off: renders an on-brand paper-plane fallback illustration to AVIF.
// Used as the featured image for tutorials that have no real folding photo yet
// (faucon, rond, lanceur, intercepteur). Decorative only — not a step diagram.
// Run: node scripts/make-tutorial-fallback.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'tutoriels');

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#dcefff"/>
      <stop offset="0.55" stop-color="#a7d5f7"/>
      <stop offset="1" stop-color="#5aa9e6"/>
    </linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#e8eef4"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#1c3a5e" flood-opacity="0.25"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>

  <!-- dotted flight trajectory -->
  <path d="M 90 540 Q 430 470 640 300 T 1130 120"
        fill="none" stroke="#ffffff" stroke-width="6"
        stroke-linecap="round" stroke-dasharray="2 26" opacity="0.85"/>

  <!-- safety-orange accent dot at launch -->
  <circle cx="90" cy="540" r="12" fill="#f4741f"/>

  <!-- paper plane (dart), nose up-right -->
  <g filter="url(#soft)" transform="translate(600 300) rotate(-18)">
    <!-- far wing -->
    <path d="M -150 -70 L 210 -6 L -70 20 Z" fill="url(#paper)"/>
    <!-- body underside -->
    <path d="M -150 -70 L 210 -6 L -70 78 Z" fill="#cfdae6"/>
    <!-- near wing -->
    <path d="M -150 -70 L 210 -6 L -70 46 L -70 20 Z" fill="#ffffff"/>
    <!-- center fold line -->
    <path d="M -150 -70 L 210 -6" fill="none" stroke="#b9c6d4" stroke-width="2.5"/>
    <path d="M -70 20 L 210 -6" fill="none" stroke="#dbe4ee" stroke-width="2"/>
  </g>
</svg>`;

const buf = Buffer.from(svg);
await sharp(buf).avif({ quality: 72 }).toFile(join(outDir, 'tutoriel-generique.avif'));
console.log('wrote src/assets/tutoriels/tutoriel-generique.avif');
