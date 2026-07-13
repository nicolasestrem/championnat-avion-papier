import { describe, it, expect } from 'vitest';
import { buildEvent, buildHowTo, buildFaq, buildBreadcrumb, buildOrganization } from './schema';

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

  it('howto numbers steps from 1', () => {
    const h = buildHowTo('t', 'd', [{ texte: 'a' }, { texte: 'b' }]);
    expect(h.step[1].position).toBe(2);
    expect(h.step[0].text).toBe('a');
  });

  it('howto includes totalTime only when provided', () => {
    expect('totalTime' in buildHowTo('t', 'd', [{ texte: 'a' }])).toBe(false);
    expect(buildHowTo('t', 'd', [{ texte: 'a' }], 'PT10M').totalTime).toBe('PT10M');
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
