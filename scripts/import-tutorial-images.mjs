// Converts raw tutorial source images into committed, optimized AVIF assets.
//
// Reads   src/assets/tutoriels/_incoming/<slug>/{hero,etape-N}.{jpg,png,gif}
// Writes  src/assets/tutoriels/<slug>-{hero,etape-N}.avif
//
// _incoming/ is gitignored — only the derived AVIFs are committed. StepList
// renders at 900px max, so 1200px wide is the useful ceiling.
// Run: node scripts/import-tutorial-images.mjs <slug> [<slug>...]
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join, parse as parsePath } from 'node:path';
import { readdir, mkdir, stat } from 'node:fs/promises';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const incomingDir = join(root, 'src', 'assets', 'tutoriels', '_incoming');
const outDir = join(root, 'src', 'assets', 'tutoriels');

const WIDTH = 1200;
const QUALITY = 72;
const SOURCE_EXT = /\.(jpe?g|png|gif|webp|avif)$/i;

// Accept a bare slug, but tolerate what shell autocomplete actually produces —
// a trailing separator, or the whole `src/assets/tutoriels/_incoming/f16` path.
// The slug also names the output file, so an unstripped `f16/` would try to
// write `<outDir>/f16/-hero.avif` into a directory that doesn't exist.
const slugs = process.argv
  .slice(2)
  .map((s) => s.replace(/[/\\]+$/, '').split(/[/\\]/).pop())
  .filter(Boolean);
if (slugs.length === 0) {
  console.error('Usage: node scripts/import-tutorial-images.mjs <slug> [<slug>...]');
  process.exit(1);
}

// etape-2 must sort before etape-10, and hero always leads.
function order(name) {
  if (name === 'hero') return -1;
  const m = name.match(/etape-(\d+)/);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

await mkdir(outDir, { recursive: true });

let converted = 0;
let failed = 0;

for (const slug of slugs) {
  const dir = join(incomingDir, slug);
  let entries;
  try {
    entries = (await readdir(dir)).filter((f) => SOURCE_EXT.test(f));
  } catch {
    console.error(`✗ ${slug}: no such folder ${dir}`);
    failed++;
    continue;
  }
  if (entries.length === 0) {
    console.error(`✗ ${slug}: no convertible images in ${dir}`);
    failed++;
    continue;
  }

  entries.sort((a, b) => order(parsePath(a).name) - order(parsePath(b).name));
  console.log(`\n${slug} (${entries.length} images)`);

  for (const file of entries) {
    const base = parsePath(file).name;
    const outName = `${slug}-${base}.avif`;
    const outPath = join(outDir, outName);
    try {
      const input = join(dir, file);
      const { size: inSize } = await stat(input);
      // autoOrient: a no-op for AVIF today — sharp's AVIF encoder already bakes
      // in EXIF orientation (measured: identical pixels with and without it).
      // Kept because that guarantee is format-specific: switch this pipeline to
      // PNG/JPEG/WebP and an EXIF-rotated phone photo silently comes out
      // sideways. One call to stay correct regardless of output format.
      // withoutEnlargement: diagrams are often already under 1200px — upscaling
      // a line drawing only inflates the file without adding detail.
      const info = await sharp(input)
        .autoOrient()
        .resize({ width: WIDTH, withoutEnlargement: true })
        .avif({ quality: QUALITY })
        .toFile(outPath);
      const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
      console.log(
        `  ${outName.padEnd(28)} ${info.width}px  ${kb(inSize)} → ${kb(info.size)}`,
      );
      converted++;
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      failed++;
    }
  }
}

console.log(`\nConverted ${converted} image(s), ${failed} failure(s).`);
if (failed > 0) process.exit(1);
