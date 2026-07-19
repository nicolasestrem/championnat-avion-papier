import { describe, expect, test } from 'vitest';

import { validatePublicHtml } from './analytics-tags.mjs';

const GA4_ID = 'G-EHTVL72LRY';
const GTM_ID = 'GTM-N59XNT8X';

function pageHtml({ config = `gtag('config', '${GA4_ID}')`, bootstrap, bodyExtra = '' } = {}) {
  const gtmBootstrap =
    bootstrap ??
    `j.src='https://www.googletagmanager.com/gtm.js?id='+i;})(window,document,'script','dataLayer','${GTM_ID}');`;

  return `<!doctype html>
<html>
  <head>
    <script>${gtmBootstrap}</script>
    <script src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
    <script>${config}</script>
  </head>
  <body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"></iframe></noscript>
    <p>Documentation may mention ${GA4_ID} and ${GTM_ID} without adding tags.</p>
    ${bodyExtra}
  </body>
</html>`;
}

describe('validatePublicHtml', () => {
  test('accepts formatting variations and ignores identifier mentions in page content', () => {
    const html = pageHtml({
      config: `gtag( "config" , "${GA4_ID}" );`,
      bootstrap: `j.src='https://www.googletagmanager.com/gtm.js?id='+i;})( window , document , "script" , "dataLayer" , "${GTM_ID}" )`,
    });

    expect(validatePublicHtml(html, 'index.html')).toEqual([]);
  });

  test('still rejects duplicate GA4 configuration calls', () => {
    const config = `gtag('config', '${GA4_ID}'); gtag("config", "${GA4_ID}");`;

    expect(validatePublicHtml(pageHtml({ config }), 'index.html')).toContain(
      'index.html: expected one GA4 config call',
    );
  });

  test('rejects a second executable GA4 block in the body', () => {
    const bodyExtra = `
      <script src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
      <script>gtag('config', '${GA4_ID}')</script>`;

    const errors = validatePublicHtml(pageHtml({ bodyExtra }), 'index.html');

    expect(errors).toContain('index.html: expected one GA4 loader');
    expect(errors).toContain('index.html: expected one GA4 config call');
  });
});
