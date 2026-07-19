// Verifies that every public Astro-rendered HTML page contains the approved
// GA4 and Google Tag Manager snippets exactly once. The standalone Sveltia
// CMS admin page is intentionally excluded from required tag presence.
// Usage: node scripts/check-analytics-tags.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const ADMIN_HTML = 'admin/index.html';
const GA4_ID = 'G-EHTVL72LRY';
const GTM_ID = 'GTM-N59XNT8X';
const GA4_LOADER = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
const GA4_CONFIG = `gtag('config', '${GA4_ID}')`;
const GTM_LOADER_PREFIX = 'https://www.googletagmanager.com/gtm.js?id=';
const GTM_FALLBACK = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(2);
}

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function relativeHtmlPath(file) {
  return relative(DIST, file).split(sep).join('/');
}

function countOccurrences(value, needle) {
  return value.split(needle).length - 1;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const htmlFiles = walk(DIST).filter((file) => file.endsWith('.html'));
const publicHtmlFiles = htmlFiles.filter((file) => relativeHtmlPath(file) !== ADMIN_HTML);
const errors = [];

if (publicHtmlFiles.length === 0) {
  errors.push('dist/: no public HTML files discovered');
}

for (const file of publicHtmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = relativeHtmlPath(file);
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];

  if (head === undefined) {
    errors.push(`${page}: missing <head>`);
  } else {
    if (countOccurrences(head, GTM_LOADER_PREFIX) !== 1) {
      errors.push(`${page}: expected one GTM head loader`);
    }
    if (countOccurrences(head, GA4_LOADER) !== 1) {
      errors.push(`${page}: expected one GA4 loader`);
    }
    const gtmIndex = head.indexOf(GTM_LOADER_PREFIX);
    const ga4Index = head.indexOf(GA4_LOADER);
    if (gtmIndex >= 0 && ga4Index >= 0 && gtmIndex > ga4Index) {
      errors.push(`${page}: GTM loader must precede GA4 loader`);
    }
  }

  if (body === undefined) {
    errors.push(`${page}: missing <body>`);
  } else {
    const fallbackPattern = new RegExp(
      `^\\s*<noscript>\\s*<iframe\\b[^>]*\\bsrc=["']${escapeRegex(GTM_FALLBACK)}["'][^>]*>`,
      'i',
    );
    if (!fallbackPattern.test(body)) {
      errors.push(`${page}: GTM fallback must be the first body child`);
    }
  }

  if (countOccurrences(html, GA4_CONFIG) !== 1) {
    errors.push(`${page}: expected one GA4 config call`);
  }
  if (countOccurrences(html, GTM_FALLBACK) !== 1) {
    errors.push(`${page}: expected one GTM fallback URL`);
  }
  if (countOccurrences(html, GA4_ID) !== 2) {
    errors.push(`${page}: expected GA4 ID exactly twice`);
  }
  if (countOccurrences(html, GTM_ID) !== 2) {
    errors.push(`${page}: expected GTM ID exactly twice`);
  }
}

const adminFile = htmlFiles.find((file) => relativeHtmlPath(file) === ADMIN_HTML);
if (adminFile) {
  const adminHtml = readFileSync(adminFile, 'utf8');
  if (adminHtml.includes(GA4_ID) || adminHtml.includes(GTM_ID)) {
    errors.push(`${ADMIN_HTML}: analytics identifiers must remain absent`);
  }
}

console.log(`Checked ${publicHtmlFiles.length} public HTML files.`);
if (errors.length === 0) {
  console.log('OK — GA4 and GTM tags are present exactly once on every public page.');
  process.exit(0);
}

console.error(`ANALYTICS TAG ERRORS (${errors.length}):`);
for (const error of errors) console.error(`  ${error}`);
process.exit(1);
