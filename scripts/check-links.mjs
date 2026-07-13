// scripts/check-links.mjs
// Crawls dist/**/*.html, extracts internal href targets, and reports any that
// resolve to neither an emitted file nor a line in public/_redirects.
// Usage: node scripts/check-links.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const REDIRECTS = join(ROOT, 'public', '_redirects');

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(2);
}

// --- Walk dist for all files (to know what was emitted) and .html files ---
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

// Set of emitted URL paths (normalized, always leading slash, POSIX separators).
const emitted = new Set();
for (const f of allFiles) {
  let rel = '/' + relative(DIST, f).split(sep).join('/');
  emitted.add(rel); // exact file, e.g. /rss.xml, /_astro/x.css, /favicon.svg
  if (rel.endsWith('/index.html')) {
    emitted.add(rel.slice(0, -'index.html'.length)); // /foo/
    emitted.add(rel.slice(0, -'/index.html'.length) + '/'); // same
  }
}

// --- Parse _redirects into exact paths and wildcard prefixes ---
const redirectExact = new Set();
const redirectWildcards = []; // prefix strings (without trailing '*')
if (existsSync(REDIRECTS)) {
  for (const raw of readFileSync(REDIRECTS, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const from = line.split(/\s+/)[0];
    if (from.endsWith('*')) redirectWildcards.push(from.slice(0, -1));
    else redirectExact.add(from);
  }
}

function isRedirected(path) {
  if (redirectExact.has(path)) return true;
  return redirectWildcards.some((prefix) => path.startsWith(prefix));
}

// --- Extract internal hrefs from each html file ---
const hrefRe = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const broken = [];
const seen = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const pageRel = '/' + relative(DIST, file).split(sep).join('/');
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    let href = m[1].trim();
    // Skip external, anchors, mailto/tel, protocol-relative, data URIs
    if (
      href === '' ||
      href.startsWith('#') ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('data:') ||
      href.startsWith('javascript:')
    ) {
      continue;
    }
    // Only check absolute-path internal links (site is trailingSlash:always,
    // and all internal links in this codebase are root-relative).
    if (!href.startsWith('/')) continue;
    // Strip query and hash.
    href = href.split('#')[0].split('?')[0];
    if (href === '') continue;

    const key = href;
    if (seen.has(key)) continue;
    seen.add(key);

    if (emitted.has(href)) continue;
    // Try adding a trailing slash (directory route).
    if (!href.endsWith('/') && emitted.has(href + '/')) continue;
    if (isRedirected(href)) continue;

    broken.push({ href, page: pageRel });
  }
}

console.log(`Crawled ${htmlFiles.length} HTML files.`);
console.log(`Emitted path entries: ${emitted.size}. Unique internal links checked: ${seen.size}.`);
if (broken.length === 0) {
  console.log('OK — no broken internal links.');
  process.exit(0);
}
console.log(`\nBROKEN INTERNAL LINKS (${broken.length}):`);
for (const b of broken) console.log(`  ${b.href}   (first seen in ${b.page})`);
process.exit(1);
