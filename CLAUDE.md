# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start Astro dev server on localhost:4321
npm run build        # Build production site to dist/
npm run preview      # Preview production build locally
```

### Testing
```bash
npm run test         # Run all tests (E2E + CSS linting)
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run Playwright tests with UI mode
npm run test:e2e:headed # Run Playwright tests in headed mode
npm run test:e2e tests/e2e/homepage.spec.ts # Run specific test file
```

### Linting & Formatting
```bash
npm run lint:css     # Check CSS with Stylelint
npm run lint:css:fix # Auto-fix CSS issues
```

### Performance
```bash
npm run lighthouse   # Run Lighthouse CI performance tests
npm run lighthouse:view # View Lighthouse report
```

## Architecture

### Tech Stack
- **Framework**: Astro (Static Site Generator)
- **CSS**: Tailwind CSS v4 via Vite plugin
- **Testing**: Playwright (E2E), Stylelint (CSS), Lighthouse CI (Performance)
- **Language**: TypeScript for tests, Astro components for UI

### Project Structure
- `src/pages/` - Astro page components (routes)
- `src/components/` - Reusable Astro components (Header, Footer, Hero)
- `src/layouts/` - Page layout templates
- `src/styles/` - Global CSS with Tailwind directives
- `tests/e2e/` - Playwright E2E test specs
- `public/` - Static assets served directly

### Key Patterns

#### Component Structure
Astro components use frontmatter (---) for logic and props, followed by HTML template with embedded expressions. Components import styles via global.css which includes Tailwind.

#### Routing
File-based routing through `src/pages/`. Each `.astro` file becomes a route.

#### Testing Strategy
- E2E tests verify user flows across browsers/devices
- Tests use page object pattern with data-testid attributes
- Lighthouse CI enforces performance budgets (90+ performance, 100 accessibility/SEO)

#### Deployment
Static build outputs to `dist/` folder. Configured for Netlify/Vercel with automatic preview deployments on PRs.

### Contact Form Integration
Contact form uses Formspree. Set `PUBLIC_FORMSPREE_ID` in `.env` and the `contact.astro` page will build the endpoint automatically.

### Performance Targets
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP < 1.0s, TTI < 2.0s, CLS < 0.1

### CSS Architecture
Uses Tailwind CSS v4 with custom CSS properties for theming:
- Primary colors: Rotary blue (#005DAA) and gold (#F7A81B)
- Responsive utilities via Tailwind classes
- Global styles in `src/styles/global.css`

### CI/CD Workflows
GitHub Actions configured for:
- PR checks (tests, linting, Lighthouse)
- Deployment pipeline
- Automated testing on multiple browsers