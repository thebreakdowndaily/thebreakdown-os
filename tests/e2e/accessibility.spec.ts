import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Focus: Keyboard navigation, Tab order, ARIA, Headings, Buttons, SVG, Focus, WCAG AA
test.describe('Accessibility (WCAG AA)', () => {
  const routesToTest = [
    '/',
    '/search',
    '/topic/economy',
    '/entity/un',
    '/story/mgnrega-reform'
  ];

  for (const route of routesToTest) {
    test(`should not have any automatically detectable accessibility issues on ${route}`, async ({ page }) => {
      await page.goto(route);
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
