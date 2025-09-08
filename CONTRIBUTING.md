# Contributing to Championnat d'Avions en Papier

Thank you for your interest in contributing to the Paper Airplane World Championship website! We welcome contributions from everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)

## 📜 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/championnat-avion-papier.git
   cd championnat-avion-papier
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/championnat-avion-papier.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Process

### 1. Before You Start

- Check existing issues and PRs to avoid duplicate work
- For significant changes, open an issue first to discuss
- Ensure your fork is up to date with the main branch

### 2. Making Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed
- Write/update tests for your changes

### 3. Testing Your Changes

Run all tests before submitting:

```bash
# Build the project
npm run build

# Run E2E tests
npm run test:e2e

# Run CSS linting
npm run lint:css

# Run Lighthouse CI
npm run lighthouse
```

## 📝 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint rules (run `npm run lint`)
- Use meaningful variable and function names
- Keep functions small and focused
- Use async/await over callbacks

### Astro Components

- Keep components small and reusable
- Use TypeScript for props interface
- Document component props
- Example:

```astro
---
export interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<div>
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</div>
```

### CSS/Tailwind

- Use Tailwind utility classes
- Create custom components in `global.css` for reusable styles
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

### Accessibility

- Use semantic HTML elements
- Add proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios (WCAG AA)

## 📤 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
feat(homepage): add hero section animation
fix(contact): resolve form submission error
docs(readme): update deployment instructions
style(global): format code with prettier
test(e2e): add contact form tests
```

## 🔄 Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** with:
   - Clear title describing the change
   - Description of what and why
   - Reference to related issues
   - Screenshots for UI changes
   - Test results

4. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Updated documentation

   ## Screenshots (if applicable)
   
   ## Related Issues
   Fixes #(issue number)
   ```

5. **After Review**:
   - Address review feedback
   - Keep PR updated with main branch
   - Squash commits if requested

## 🧪 Testing

### E2E Tests (Playwright)

Located in `tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Championnat/);
});
```

### Running Tests

```bash
# All tests
npm run test

# E2E tests only
npm run test:e2e

# With UI
npm run test:e2e -- --ui

# Specific test file
npm run test:e2e tests/e2e/homepage.spec.ts
```

## 🐛 Reporting Issues

### Before Creating an Issue

- Search existing issues
- Check if it's already fixed in main branch
- Gather relevant information

### Issue Template

```markdown
## Bug Report

### Description
Clear description of the bug

### Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- Browser: [e.g., Chrome 100]
- OS: [e.g., Windows 11]
- Node version: [e.g., 18.0.0]

### Screenshots
If applicable

### Additional Context
Any other relevant information
```

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

- **Translations**: Help translate the site to other languages
- **Accessibility**: Improve screen reader support and keyboard navigation
- **Performance**: Optimize images, reduce bundle size
- **Documentation**: Improve guides and API documentation
- **Testing**: Add more test coverage
- **Design**: Enhance UI/UX
- **Features**: Add new functionality (discuss first in issues)

## 💬 Getting Help

- **Discord**: Join our community server
- **Issues**: Ask questions in GitHub issues
- **Email**: contact@championnatavionpapier.fr

## 🏆 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Invited to contributor meetings

Thank you for contributing to make this project better! 🚀