export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Accueil', href: '/' },
  {
    label: 'Le Championnat',
    href: '/histoire-championnat-avion-papier/',
    children: [
      { label: 'Histoire', href: '/histoire-championnat-avion-papier/' },
      { label: 'Activités', href: '/activites/' },
      { label: 'Éditions', href: '/editions/2025/' },
      { label: 'Records', href: '/records-avion-en-papier/' },
    ],
  },
  { label: 'Tutoriels', href: '/ressources-avions-papier/' },
  { label: 'Actualités', href: '/blog/' },
  { label: 'Contact & FAQ', href: '/contact-faq/' },
];

/**
 * Normalise a pathname so `/foo` and `/foo/` compare equal, and the root
 * path stays `/`.
 */
function normalise(path: string): string {
  if (path === '/' || path === '') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

/**
 * True when `href` is the current route, or (for parents) when any child
 * route is current. Used to highlight the active nav entry.
 */
export function isActive(href: string, pathname: string, children?: NavChild[]): boolean {
  const here = normalise(pathname);
  if (normalise(href) === here) return true;
  if (children) return children.some((c) => normalise(c.href) === here);
  return false;
}
