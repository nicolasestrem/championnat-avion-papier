# GA4 and Google Tag Manager Integration Design

**Date:** 2026-07-19  
**Status:** Approved for specification  
**GA4 measurement ID:** `G-EHTVL72LRY`  
**Google Tag Manager container ID:** `GTM-N59XNT8X`

## Goal

Install Google Analytics 4 and Google Tag Manager across every public Astro-rendered
page. GA4 must start collecting page views immediately through its direct Google tag,
while the GTM container must be available for future tag management.

## Current state

- All public site layouts render through `src/layouts/BaseLayout.astro`.
- Shared SEO metadata and the existing Google AdSense loader render through
  `src/components/seo/BaseHead.astro`.
- Cloudflare Web Analytics loads near the end of the shared `<body>`.
- The published `GTM-N59XNT8X` container was inspected on 2026-07-19 and exposed an
  empty tag list (`"tags":[]`). It therefore does not currently publish the GA4
  measurement ID and will not duplicate the direct GA4 page-view event.
- `/admin/` is the standalone Sveltia CMS application copied from `public/admin/`; it
  does not render through the public Astro layout and is outside the analytics scope.

## Architecture

The integration uses the standard Google snippets in the one shared public layout:

1. The GTM loader initializes the default `dataLayer` and asynchronously loads
   `gtm.js?id=GTM-N59XNT8X` near the start of `<head>`.
2. The direct GA4 loader asynchronously loads
   `gtag/js?id=G-EHTVL72LRY`, then initializes `window.dataLayer`, defines `gtag`, and
   calls `gtag('config', 'G-EHTVL72LRY')`.
3. The GTM `<noscript>` fallback iframe is the first child of `<body>` and points to
   `ns.html?id=GTM-N59XNT8X`.

Both products intentionally share the default `dataLayer`. GTM is loaded first so its
container-start event is queued before the direct GA4 configuration. All loaders are
asynchronous and do not block page rendering.

The IDs are public property identifiers, not secrets, and are intentionally hardcoded
in the shared layout. This matches the repository's existing treatment of the AdSense
publisher ID and Cloudflare Web Analytics token.

## Data flow

On a normal JavaScript-enabled page load:

1. The GTM bootstrap pushes `gtm.start` into `dataLayer` and requests the published
   container.
2. The direct Google tag queues `js` and `config` commands in the same `dataLayer`.
3. GA4 processes `G-EHTVL72LRY` and sends its default page-view event.
4. The currently empty GTM container sends no GA4 event of its own.

When JavaScript is disabled, only the GTM fallback iframe can load. Direct GA4 does not
run in that mode, which is standard Google tag behavior.

## Duplicate-event invariant

There must be exactly one owner of the GA4 configuration. For this implementation, the
repository's direct `gtag('config', 'G-EHTVL72LRY')` call is that owner.

If a Google tag for `G-EHTVL72LRY` is later added and published inside
`GTM-N59XNT8X`, the direct GA4 loader and configuration must be removed from the
repository in the same release. Publishing both configurations can create duplicate
page views and events.

## Consent and privacy boundary

This change installs the requested tags but does not introduce a consent-management
platform or redesign the site's existing privacy behavior. The deployment documentation
must record that GA4 and GTM are present and that European consent requirements need to
be handled consistently with the existing AdSense integration before production use.

## Verification

Implementation follows a red-green build-output test:

1. Add a checker that reads generated public HTML and asserts the required GTM loader,
   GTM fallback iframe, GA4 loader, and GA4 `config` call.
2. Run it against the current build and confirm it fails because the tags are absent.
3. Add the shared-layout integration.
4. Rebuild and confirm the checker passes.

The checker must also enforce:

- each public Astro-rendered HTML page contains each required loader/configuration once;
- the GTM iframe appears immediately after the opening `<body>` apart from whitespace;
- the direct GA4 configuration contains the approved measurement ID;
- the GTM loader and fallback contain the approved container ID;
- the standalone `/admin/` CMS page is excluded from the public-site assertion;
- the canonical `npm run verify` gate runs the tag checker after the build.

Fresh verification before completion consists of the focused red-green tag check,
unit tests, and the repository's canonical `npm run verify` command.

## Documentation

`docs/DEPLOYMENT.md` will describe the installed identifiers, shared-layout placement,
published-container state, duplicate-event invariant, and consent follow-up.
`CHANGELOG.md` will summarize the user-visible analytics integration and verification
gate.

## Out of scope

- Creating or publishing tags, triggers, or variables inside the GTM web interface.
- Adding custom GA4 events, conversions, ecommerce tracking, user IDs, or dimensions.
- Replacing Cloudflare Web Analytics or Google AdSense.
- Building or selecting a consent-management platform.
- Changing the analytics behavior of the standalone Sveltia CMS admin application.
