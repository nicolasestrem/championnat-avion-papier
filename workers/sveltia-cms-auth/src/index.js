/**
 * Sveltia CMS ⇄ GitHub OAuth handshake, on Cloudflare Workers.
 *
 * Two routes:
 *   GET /auth      → redirects the editor to GitHub's authorize page.
 *   GET /callback  → exchanges the returned code for a token and hands it back
 *                    to the CMS window via postMessage.
 *
 * Set `base_url` in public/admin/config.yml to this Worker's deployed URL.
 * Requires secrets GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET and var ALLOWED_DOMAINS.
 *
 * The CMS origin is captured from the Referer on /auth (the only request that
 * carries it), persisted in a cookie next to the CSRF state, and re-validated
 * on /callback — the GitHub redirect has no CMS Referer, so recomputing it
 * there would silently fall back to the production domain and break login
 * from localhost / preview deploys. The token is only ever posted to that
 * validated origin, and the callback page ignores messages from any other.
 */

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token';

/** Random, URL-safe state string for CSRF protection. */
function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalize a URL/origin string and return its origin if the host is an
 * allowed domain (or a local/preview host), otherwise null.
 */
function validateOrigin(value, allowed) {
  try {
    const { protocol, hostname, origin } = new URL(value);
    const local = hostname === 'localhost' || hostname === '127.0.0.1';
    if (protocol !== 'https:' && !local) return null;
    const ok =
      local ||
      hostname.endsWith('.workers.dev') ||
      hostname.endsWith('.pages.dev') ||
      allowed.some((d) => hostname === d || hostname.endsWith(`.${d}`));
    return ok ? origin : null;
  } catch {
    return null;
  }
}

/** HTML that posts the auth result back to the CMS window and closes. */
function callbackPage(status, payload, allowedOrigin) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html><html><body><script>
    (function () {
      var origin = ${JSON.stringify(allowedOrigin)};
      function receive(e) {
        if (e.source !== window.opener || e.origin !== origin) return;
        window.removeEventListener('message', receive, false);
        window.opener.postMessage(${JSON.stringify(message)}, origin);
      }
      window.addEventListener('message', receive, false);
      window.opener && window.opener.postMessage('authorizing:github', origin);
    })();
  </script><p>Authentification en cours… vous pouvez fermer cette fenêtre.</p></body></html>`;
}

function htmlResponse(body, status, extraHeaders = []) {
  const headers = new Headers({ 'Content-Type': 'text/html; charset=utf-8' });
  for (const [k, v] of extraHeaders) headers.append(k, v);
  return new Response(body, { status, headers });
}

const COOKIE_ATTRS = 'HttpOnly; Secure; SameSite=Lax; Path=/';
const CLEAR_COOKIES = [
  ['Set-Cookie', `sveltia_state=; ${COOKIE_ATTRS}; Max-Age=0`],
  ['Set-Cookie', `sveltia_origin=; ${COOKIE_ATTRS}; Max-Age=0`],
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowed = (env.ALLOWED_DOMAINS || '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    const productionOrigin = allowed[0] ? `https://${allowed[0]}` : null;

    if (url.pathname === '/auth') {
      // The CMS page is the Referer here; reflect it when it matches an
      // allowed domain (or a local/preview host) so login also works on
      // localhost, *.workers.dev and preview deploys.
      const referer = request.headers.get('Referer');
      const cmsOrigin = (referer && validateOrigin(referer, allowed)) || productionOrigin;
      if (!cmsOrigin) {
        return new Response('Origine non autorisée.', { status: 403 });
      }
      const state = randomState();
      const authorize = new URL(GITHUB_AUTHORIZE);
      authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authorize.searchParams.set('scope', 'repo,user');
      authorize.searchParams.set('state', state);
      const headers = new Headers({ Location: authorize.href });
      headers.append('Set-Cookie', `sveltia_state=${state}; ${COOKIE_ATTRS}; Max-Age=600`);
      headers.append(
        'Set-Cookie',
        `sveltia_origin=${encodeURIComponent(cmsOrigin)}; ${COOKIE_ATTRS}; Max-Age=600`,
      );
      return new Response(null, { status: 302, headers });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const cookie = request.headers.get('Cookie') || '';
      const savedState = /(?:^|;\s*)sveltia_state=([^;]+)/.exec(cookie)?.[1];
      const savedOrigin = /(?:^|;\s*)sveltia_origin=([^;]+)/.exec(cookie)?.[1];

      // Re-validate the persisted origin instead of trusting the cookie blindly;
      // the GitHub redirect carries no usable Referer.
      const cmsOrigin = savedOrigin
        ? validateOrigin(decodeURIComponent(savedOrigin), allowed)
        : null;
      if (!cmsOrigin) {
        return htmlResponse('<p>Session d’authentification invalide ou expirée.</p>', 400, CLEAR_COOKIES);
      }

      if (!code || !state || state !== savedState) {
        return htmlResponse(
          callbackPage('error', { error: 'invalid_state' }, cmsOrigin),
          400,
          CLEAR_COOKIES,
        );
      }

      const tokenRes = await fetch(GITHUB_TOKEN, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/callback`,
        }),
      });
      const data = await tokenRes.json();

      if (data.error || !data.access_token) {
        return htmlResponse(
          callbackPage('error', { error: data.error || 'no_token' }, cmsOrigin),
          401,
          CLEAR_COOKIES,
        );
      }

      return htmlResponse(
        callbackPage('success', { token: data.access_token, provider: 'github' }, cmsOrigin),
        200,
        CLEAR_COOKIES,
      );
    }

    return new Response('Sveltia CMS auth worker', { status: 200 });
  },
};
