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

export function buildEvent(r: EventInput) {
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
      price: '8',
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
  etapes: { texte: string }[],
  totalTime?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description,
    ...(totalTime ? { totalTime } : {}),
    step: etapes.map((e, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: e.texte,
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
