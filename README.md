# 🛩️ Championnat du Monde de Lancer d'Avions en Papier 2025

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Modern, fast, and accessible website for the 2025 Paper Airplane World Championship in Mérignac, France. Built with Astro for optimal performance and user experience.

## 🚀 Features

- ⚡ **Lightning Fast**: Static site generation with Astro
- 📱 **Fully Responsive**: Mobile-first design that works on all devices
- 🎨 **Modern Design**: Clean, accessible UI with Tailwind CSS
- 🔍 **SEO Optimized**: Meta tags, Open Graph, and structured data
- ♿ **Accessible**: WCAG 2.1 AA compliant
- 🌍 **Performance**: 95+ Lighthouse score
- 🔒 **Secure**: No database, no vulnerabilities
- 💰 **Cost Effective**: Free hosting on Netlify/Vercel

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Git for version control

## 🛠️ Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/championnat-avion-papier.git

# Navigate to project directory
cd championnat-avion-papier

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:4321` to see your site.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run all tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint:css     # Run Stylelint
npm run lighthouse   # Run Lighthouse CI
```

## 🏗️ Project Structure

```
championnat-avion-papier/
├── public/              # Static assets (images, fonts, etc.)
│   └── favicon.svg
├── src/
│   ├── components/      # Reusable Astro components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── Hero.astro
│   ├── layouts/         # Page layouts
│   │   └── Layout.astro
│   ├── pages/           # Route pages
│   │   ├── index.astro  # Homepage
│   │   └── contact.astro # Contact/FAQ page
│   └── styles/          # Global styles
│       └── global.css
├── tests/               # Test files
│   ├── e2e/            # Playwright E2E tests
│   └── lighthouse/     # Lighthouse CI configs
└── .github/            # GitHub Actions workflows
    └── workflows/
```

## 🎨 Customization

### Colors

The color scheme is defined in `src/styles/global.css`:

```css
:root {
  --color-primary: #0066CC;      /* Primary blue */
  --color-secondary: #FFA500;    /* Orange accent */
  --color-rotary-blue: #005DAA;  /* Rotary blue */
  --color-rotary-gold: #F7A81B;  /* Rotary gold */
}
```

### Content

- **Homepage**: Edit `src/pages/index.astro`
- **Contact Page**: Edit `src/pages/contact.astro`
- **Header/Footer**: Edit components in `src/components/`

### Contact Form

Set your Formspree ID in a `.env` file as `PUBLIC_FORMSPREE_ID` and the contact page will submit to the correct endpoint automatically.

## 🚀 Deployment

### Netlify (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Deploy settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in project root
3. Follow the prompts

### Manual Deployment

```bash
# Build the project
npm run build

# The 'dist' folder contains your static site
# Upload contents to any static hosting provider
```

## 🧪 Testing

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e homepage.spec.ts
```

### CSS Linting (Stylelint)

```bash
# Check CSS files
npm run lint:css

# Auto-fix issues
npm run lint:css -- --fix
```

### Performance Testing (Lighthouse)

```bash
# Run Lighthouse CI
npm run lighthouse

# View report
open .lighthouseci/report.html
```

## 📊 Performance Metrics

Target metrics for production:

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100
- **First Contentful Paint**: < 1.0s
- **Time to Interactive**: < 2.0s
- **Cumulative Layout Shift**: < 0.1

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Contact Form (Formspree)
PUBLIC_FORMSPREE_ID=your_formspree_id

# Google Maps API (optional)
PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key

# Analytics (optional)
PUBLIC_GA_ID=your_google_analytics_id
```

## 🐛 Troubleshooting

### Common Issues

**Development server not starting:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
# Clear Astro cache
rm -rf .astro
npm run build
```

**Styling issues:**
```bash
# Rebuild Tailwind CSS
npm run dev -- --force
```

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Playwright Documentation](https://playwright.dev)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rotary Club Mérignac** - Event organizer
- **Rotaract Bordeaux Lys** - Support and collaboration
- All sponsors and partners who make this event possible

## 📞 Contact

- **Email**: bonjour@championnatavionpapier.fr
- **Website**: [championnatavionpapier.fr](https://championnatavionpapier.fr)
- **Facebook**: [@rotarymerignac](https://www.facebook.com/rotarymerignac)
- **Instagram**: [@rotarymerignac](https://www.instagram.com/rotarymerignac)

---

Built with ❤️ for the Paper Airplane World Championship 2025
