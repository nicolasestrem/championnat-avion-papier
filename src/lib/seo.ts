export const SITE = {
  url: 'https://championnatavionpapier.fr',
  name: 'Championnat du Monde de Lancer d’Avions en Papier',
  locale: 'fr_FR',
  twitter: '',
  defaultImage: '/og-default.jpg',
} as const;

export function absolute(path: string): string {
  return new URL(path, SITE.url).href;
}
