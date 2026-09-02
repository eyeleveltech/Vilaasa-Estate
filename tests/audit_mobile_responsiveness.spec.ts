import { test, expect } from '@playwright/test';

const ROUTES_TO_AUDIT = [
  '/',
  '/home',
  '/domestic',
  '/domestic/real-estate',
  '/domestic/franchise',
  '/international',
  '/contact',
  '/calendar',
  '/wealth-projector',
  '/admin/login',
  '/admin/dashboard',
  '/admin/properties',
  '/admin/properties/new',
  '/admin/franchises',
  '/admin/franchises/new',
  '/partner/login',
  '/partner/register',
  '/vault/login',
];

test.use({ viewport: { width: 320, height: 640 } });

test.describe('Mobile 320px Responsiveness & Horizontal Overflow Audit', () => {
  for (const route of ROUTES_TO_AUDIT) {
    test(`Audit 320px responsiveness on ${route}`, async ({ page }) => {
      // Set admin token so admin pages load without redirect
      await page.addInitScript(() => {
        localStorage.setItem('vilaasa-admin-token', 'mock_token');
        localStorage.setItem('vilaasa-admin-user', JSON.stringify({ role: 'SUPER_ADMIN', name: 'Admin', email: 'admin@vilaasa.com' }));
        localStorage.setItem('vilaasa-otp-access', JSON.stringify({ verifiedAt: Date.now() }));
      });

      await page.goto(`http://localhost:8080${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Check if page causes horizontal scroll overflow
      const overflowInfo = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const hasOverflow = scrollWidth > docWidth;

        // Find elements that exceed screen width
        const overflowingElements: { tag: string; id: string; className: string; right: number; width: number }[] = [];
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 1) {
            overflowingElements.push({
              tag: el.tagName.toLowerCase(),
              id: el.id,
              className: (el.className || '').toString().slice(0, 80),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            });
          }
        });

        return { docWidth, scrollWidth, hasOverflow, overflowingElements: overflowingElements.slice(0, 10) };
      });

      console.log(`Route [${route}] Width: ${overflowInfo.docWidth}px, ScrollWidth: ${overflowInfo.scrollWidth}px, Overflow: ${overflowInfo.hasOverflow}`);
      if (overflowInfo.hasOverflow) {
        console.log(`⚠️ Overflowing elements on ${route}:`, JSON.stringify(overflowInfo.overflowingElements, null, 2));
      }
    });
  }
});
