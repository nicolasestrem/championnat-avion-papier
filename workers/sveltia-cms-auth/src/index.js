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
 */

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token';

/** Random, URL-safe state string for CSRF protection. */
function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** HTML that posts the auth result back to the CMS window and closes. */
function callbackPage(status, payload, allowedOrigin) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html><html><body><script>
    (function () {
      function receive(e) {
        window.removeEventListener('message', receive, false);
        window.opener && window.opener.postMessage(${JSON.stringify(message)}, e.origin);
      }
      window.addEventListener('message', receive, false);
      window.opener && window.opener.postMessage('authorizing:github', ${JSON.stringify(allowedOrigin)});
    })();
  </script><p>Authentification en cours… vous pouvez fermer cette fenêtre.</p></body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowed = (env.ALLOWED_DOMAINS || '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    const allowedOrigin = allowed[0] ? `https://${allowed[0]}` : '*';

    if (url.pathname === '/auth') {
      const state = randomState();
      const authorize = new URL(GITHUB_AUTHORIZE);
      authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authorize.searchParams.set('scope', 'repo,user');
      authorize.searchParams.set('state', state);
      return new Response(null, {
        status: 302,
        headers: {
          Location: authorize.href,
          'Set-Cookie': `sveltia_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
        },
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const cookie = request.headers.get('Cookie') || '';
      const savedState = /(?:^|;\s*)sveltia_state=([^;]+)/.exec(cookie)?.[1];

      if (!code || !state || state !== savedState) {
        return new Response(
          callbackPage('error', { error: 'invalid_state' }, allowedOrigin),
          { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
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
        return new Response(
          callbackPage('error', { error: data.error || 'no_token' }, allowedOrigin),
          { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        );
      }

      return new Response(
        callbackPage('success', { token: data.access_token, provider: 'github' }, allowedOrigin),
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Set-Cookie': 'sveltia_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
          },
        },
      );
    }

    return new Response('Sveltia CMS auth worker', { status: 200 });
  },
};
