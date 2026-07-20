import { describe, it, expect } from 'vitest';
import {
  buildEvent,
  buildHowTo,
  buildFaq,
  buildBreadcrumb,
  buildOrganization,
  buildArticle,
  parsePrice,
} from './schema';

describe('schema builders', () => {
  it('event has ISO startDate and 8 EUR offer', () => {
    const e = buildEvent({
      dateISO: '2026-06-13T11:00:00+02:00',
      lieu: 'Complexe sportif Daniel Colombier',
      ville: 'Mérignac',
      tarifCompetiteur: '8 €',
      helloAssoUrl: 'https://x',
      beneficiaire: 'Pompiers Solidaires',
    });
    expect(e.startDate).toBe('2026-06-13T11:00:00+02:00');
    expect(e.offers.price).toBe('8');
    expect(e.location.address.addressLocality).toBe('Mérignac');
  });

  it('parsePrice handles single amounts and rejects ambiguous ones', () => {
    expect(parsePrice('8 €')).toBe('8');
    expect(parsePrice('12,50 €')).toBe('12.50');
    expect(parsePrice('5 € / 10 €')).toBeUndefined();
    expect(parsePrice('Gratuit')).toBeUndefined();
  });

  it('event omits price rather than emitting a malformed one', () => {
    const base = {
      dateISO: '2026-06-13T11:00:00+02:00',
      lieu: 'L',
      ville: 'V',
      helloAssoUrl: 'https://x',
      beneficiaire: 'B',
    };
    expect('price' in buildEvent({ ...base, tarifCompetiteur: '5 € / 10 €' }).offers).toBe(false);
    expect(buildEvent({ ...base, tarifCompetiteur: '12,50 €' }).offers.price).toBe('12.50');
  });

  it('article falls back dateModified to datePublished', () => {
    const a = buildArticle({
      title: 't',
      description: 'd',
      url: 'https://x/post/',
      datePublished: '2026-01-02T00:00:00.000Z',
    });
    expect(a['@type']).toBe('BlogPosting');
    expect(a.dateModified).toBe('2026-01-02T00:00:00.000Z');
    expect(a.mainEntityOfPage['@id']).toBe('https://x/post/');
    expect('image' in a).toBe(false);
  });

  it('article keeps an explicit dateModified and image', () => {
    const a = buildArticle({
      title: 't',
      description: 'd',
      url: 'https://x/post/',
      datePublished: '2026-01-02T00:00:00.000Z',
      dateModified: '2026-03-04T00:00:00.000Z',
      image: 'https://x/i.avif',
    });
    expect(a.dateModified).toBe('2026-03-04T00:00:00.000Z');
    expect(a.image).toBe('https://x/i.avif');
  });

  it('howto numbers steps from 1', () => {
    const h = buildHowTo('t', 'd', [{ texte: 'a' }, { texte: 'b' }]);
    expect(h.step[1].position).toBe(2);
    expect(h.step[0].text).toBe('a');
  });

  it('howto includes totalTime only when provided', () => {
    expect('totalTime' in buildHowTo('t', 'd', [{ texte: 'a' }])).toBe(false);
    expect(buildHowTo('t', 'd', [{ texte: 'a' }], 'PT10M').totalTime).toBe('PT10M');
  });

  it('howto adds step image and top-level image when provided', () => {
    const h = buildHowTo(
      't',
      'd',
      [{ texte: 'a', image: 'https://x/a.avif' }],
      undefined,
      'https://x/hero.avif'
    );
    expect(h.image).toBe('https://x/hero.avif');
    expect(h.step[0].image).toBe('https://x/a.avif');
  });

  it('howto omits image keys when absent', () => {
    const h = buildHowTo('t', 'd', [{ texte: 'a' }]);
    expect('image' in h).toBe(false);
    expect('image' in h.step[0]).toBe(false);
  });

  it('faq maps questions', () => {
    const f = buildFaq([{ question: 'q', reponse: 'r' }]);
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('r');
    expect(f.mainEntity[0].name).toBe('q');
  });

  it('breadcrumb numbers list items from 1', () => {
    const b = buildBreadcrumb([
      { label: 'Accueil', url: 'https://x/' },
      { label: 'Tutoriels', url: 'https://x/tutoriels/' },
    ]);
    expect(b.itemListElement[0].position).toBe(1);
    expect(b.itemListElement[1].name).toBe('Tutoriels');
  });

  it('organization omits empty sameAs', () => {
    const o = buildOrganization({ url: 'https://x/' });
    expect('sameAs' in o).toBe(false);
    const o2 = buildOrganization({ url: 'https://x/', sameAs: ['https://insta'] });
    expect(o2.sameAs).toEqual(['https://insta']);
  });
});
