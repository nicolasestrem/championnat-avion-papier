export const GA4_ID = 'G-EHTVL72LRY';
export const GTM_ID = 'GTM-N59XNT8X';

const GA4_LOADER = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
const GTM_LOADER_PREFIX = 'https://www.googletagmanager.com/gtm.js?id=';
const GTM_FALLBACK = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const GA4_CONFIG = new RegExp(
  `\\bgtag\\s*\\(\\s*["']config["']\\s*,\\s*["']${escapeRegex(GA4_ID)}["']\\s*\\)\\s*;?`,
  'g',
);
const GTM_BOOTSTRAP = new RegExp(
  `\\}\\)\\s*\\(\\s*window\\s*,\\s*document\\s*,\\s*["']script["']\\s*,\\s*["']dataLayer["']\\s*,\\s*["']${escapeRegex(GTM_ID)}["']\\s*\\)\\s*;?`,
  'g',
);
const GA4_LOADER_TAG = new RegExp(
  `<script\\b[^>]*\\bsrc=["']${escapeRegex(GA4_LOADER)}["'][^>]*>`,
  'gi',
);

function countOccurrences(value, needle) {
  if (needle instanceof RegExp) return value.match(needle)?.length ?? 0;
  return value.split(needle).length - 1;
}

function inlineScriptContent(value) {
  return [...value.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .join('\n');
}

export function validatePublicHtml(html, page) {
  const errors = [];
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  const allInlineScripts = inlineScriptContent(html);

  if (head === undefined) {
    errors.push(`${page}: missing <head>`);
  } else {
    const headInlineScripts = inlineScriptContent(head);

    if (countOccurrences(head, GTM_LOADER_PREFIX) !== 1) {
      errors.push(`${page}: expected one GTM head loader`);
    }
    if (
      countOccurrences(head, GA4_LOADER_TAG) !== 1 ||
      countOccurrences(html, GA4_LOADER_TAG) !== 1
    ) {
      errors.push(`${page}: expected one GA4 loader`);
    }
    if (countOccurrences(headInlineScripts, GTM_BOOTSTRAP) !== 1) {
      errors.push(`${page}: expected one GTM bootstrap invocation for ${GTM_ID}`);
    }
    if (
      countOccurrences(headInlineScripts, GA4_CONFIG) !== 1 ||
      countOccurrences(allInlineScripts, GA4_CONFIG) !== 1
    ) {
      errors.push(`${page}: expected one GA4 config call`);
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
    if (countOccurrences(body, GTM_FALLBACK) !== 1) {
      errors.push(`${page}: expected one GTM fallback URL`);
    }
  }

  return errors;
}
