// Verifies that every public Astro-rendered HTML page contains the approved
// GA4 and Google Tag Manager snippets exactly once. The standalone Sveltia
// CMS admin page is intentionally excluded from required tag presence.
// Usage: node scripts/check-analytics-tags.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { GA4_ID, GTM_ID, validatePublicHtml } from './analytics-tags.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const ADMIN_HTML = 'admin/index.html';

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

const htmlFiles = walk(DIST).filter((file) => file.endsWith('.html'));
const publicHtmlFiles = htmlFiles.filter((file) => relativeHtmlPath(file) !== ADMIN_HTML);
const errors = [];

if (publicHtmlFiles.length === 0) {
  errors.push('dist/: no public HTML files discovered');
}

for (const file of publicHtmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = relativeHtmlPath(file);
  errors.push(...validatePublicHtml(html, page));
}

const adminFile = htmlFiles.find((file) => relativeHtmlPath(file) === ADMIN_HTML);
if (!adminFile) {
  errors.push(`${ADMIN_HTML}: required admin HTML file is missing`);
} else {
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
