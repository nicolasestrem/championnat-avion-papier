// Pure, unit-testable JSON-LD builders. No Astro imports here so the functions
// stay trivially testable with vitest.

const EVENT_NAME = 'Championnat du Monde de Lancer d’Avions en Papier';

export interface EventInput {
  dateISO: string;
  lieu: string;
  ville: string;
  tarifCompetiteur: string;
  helloAssoUrl: string;
  beneficiaire: string;
}

// "8 €" -> "8", "12,50 €" -> "12.50". Returns undefined for anything that is not
// a single unambiguous amount ("5 € / 10 €", "Gratuit"), so a malformed price is
// omitted from the Offer rather than emitted wrong — Google rejects the whole
// Offer on a bad price, and a range would silently advertise the wrong tariff.
export function parsePrice(raw: string): string | undefined {
  const matches = raw.replace(/,/g, '.').match(/\d+(?:\.\d+)?/g);
  return matches?.length === 1 ? matches[0] : undefined;
}

export function buildEvent(r: EventInput) {
  const price = parsePrice(r.tarifCompetiteur);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: EVENT_NAME,
    startDate: r.dateISO,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: r.lieu,
      address: {
        '@type': 'PostalAddress',
        addressLocality: r.ville,
        addressCountry: 'FR',
      },
    },
    offers: {
      '@type': 'Offer',
      // Derived from reglages so structured data stays in sync with the CMS.
      ...(price ? { price } : {}),
      priceCurrency: 'EUR',
      url: r.helloAssoUrl,
      availability: 'https://schema.org/InStock',
    },
    organizer: {
      '@type': 'Organization',
      name: 'Rotary Club de Mérignac',
      url: 'https://www.rotary-merignac.fr/',
    },
  };
}

export function buildHowTo(
  title: string,
  description: string,
  etapes: { texte: string; image?: string }[],
  totalTime?: string,
  image?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description,
    ...(image ? { image } : {}),
    ...(totalTime ? { totalTime } : {}),
    step: etapes.map((e, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: e.texte,
      ...(e.image ? { image: e.image } : {}),
    })),
  };
}

export function buildFaq(items: { question: string; reponse: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.reponse },
    })),
  };
}

export function buildBreadcrumb(trail: { label: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.label,
      item: t.url,
    })),
  };
}

export interface ArticleInput {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}

export function buildArticle(a: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': a.url },
    url: a.url,
    datePublished: a.datePublished,
    // Google treats a missing dateModified as "never updated"; fall back to the
    // publication date so the field is always present and truthful.
    dateModified: a.dateModified ?? a.datePublished,
    ...(a.image ? { image: a.image } : {}),
    author: { '@type': 'Organization', name: EVENT_NAME },
    publisher: { '@type': 'Organization', name: EVENT_NAME },
  };
}

export interface OrganizationInput {
  url: string;
  logo?: string;
  sameAs?: string[];
}

export function buildOrganization(r: OrganizationInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: EVENT_NAME,
    url: r.url,
    ...(r.logo ? { logo: r.logo } : {}),
    ...(r.sameAs && r.sameAs.length ? { sameAs: r.sameAs } : {}),
  };
}
