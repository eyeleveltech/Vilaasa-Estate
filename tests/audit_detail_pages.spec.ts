import { test } from '@playwright/test';

test.use({ viewport: { width: 320, height: 640 } });

test('Check Detail pages at 320px', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('vilaasa-otp-access', JSON.stringify({ verifiedAt: Date.now() }));
  });

  // Check domestic real estate & first property detail
  await page.goto('http://localhost:8080/domestic/real-estate', { waitUntil: 'networkidle' });
  const firstPropCard = page.locator('div[role="button"]:has-text("View")').first();
  await firstPropCard.click();
  await page.waitForURL(/\/property\/.+/);
  const currentUrl = page.url();
  console.log('Navigated to property detail:', currentUrl);

  const detailOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const overflowing: { tag: string; className: string; right: number; width: number }[] = [];
    document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 1) {
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            className: (el.className || '').toString().slice(0, 80),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          });
        }
      });
      return { docWidth, scrollWidth, hasOverflow: scrollWidth > docWidth, overflowing: overflowing.slice(0, 10) };
    });
    console.log('Property Detail 320px Overflow:', JSON.stringify(detailOverflow, null, 2));
  // Check domestic franchise & first franchise detail
  await page.goto('http://localhost:8080/domestic/franchise', { waitUntil: 'networkidle' });
  const firstFranCard = page.locator('div[role="button"]:has-text("View")').first();
  await firstFranCard.click();
  await page.waitForURL(/\/franchise\/.+/);
  const currentFranUrl = page.url();
  console.log('Navigated to franchise detail:', currentFranUrl);

  const franOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const overflowing: { tag: string; className: string; right: number; width: number }[] = [];
    document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 1) {
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            className: (el.className || '').toString().slice(0, 80),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          });
        }
      });
      return { docWidth, scrollWidth, hasOverflow: scrollWidth > docWidth, overflowing: overflowing.slice(0, 10) };
    });
    console.log('Franchise Detail 320px Overflow:', JSON.stringify(franOverflow, null, 2));
});
