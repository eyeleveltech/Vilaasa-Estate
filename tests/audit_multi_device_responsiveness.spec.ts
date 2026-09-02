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

const VIEWPORTS = [
  { name: '📱 Mobile XS (320px)', width: 320, height: 640 },
  { name: '📱 Mobile Standard (390px)', width: 390, height: 844 },
  { name: '📟 Tablet (768px)', width: 768, height: 1024 },
  { name: '💻 Laptop (1280px)', width: 1280, height: 800 },
  { name: '🖥️ Desktop (1920px)', width: 1920, height: 1080 },
];

test.describe('Universal Multi-Device Responsiveness & Zero-Overflow Audit', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of ROUTES_TO_AUDIT) {
        test(`Verify ${route} at ${vp.width}x${vp.height}`, async ({ page }) => {
          await page.addInitScript(() => {
            localStorage.setItem('vilaasa-admin-token', 'mock_token');
            localStorage.setItem(
              'vilaasa-admin-user',
              JSON.stringify({ role: 'SUPER_ADMIN', name: 'Admin', email: 'admin@vilaasa.com' })
            );
            localStorage.setItem('vilaasa-otp-access', JSON.stringify({ verifiedAt: Date.now() }));
          });

          await page.goto(`http://localhost:8080${route}`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(600);

          const result = await page.evaluate(() => {
            const docWidth = document.documentElement.clientWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const hasOverflow = scrollWidth > docWidth + 1;

            const overflowingElements: { tag: string; id: string; className: string; right: number; width: number }[] = [];
            if (hasOverflow) {
              document.querySelectorAll('*').forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.right > docWidth + 1) {
                  overflowingElements.push({
                    tag: el.tagName.toLowerCase(),
                    id: el.id,
                    className: (el.className || '').toString().slice(0, 60),
                    right: Math.round(rect.right),
                    width: Math.round(rect.width),
                  });
                }
              });
            }

            return { docWidth, scrollWidth, hasOverflow, overflowingElements: overflowingElements.slice(0, 5) };
          });

          if (result.hasOverflow) {
            console.error(
              `❌ Overflow on [${vp.name}] ${route}: docWidth=${result.docWidth}, scrollWidth=${result.scrollWidth}`,
              result.overflowingElements
            );
          }

          expect(result.hasOverflow, `Route ${route} at ${vp.name} must not have horizontal overflow`).toBe(false);
        });
      }
    });
  }
});
