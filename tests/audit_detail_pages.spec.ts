import { test } from '@playwright/test';

test.use({ viewport: { width: 320, height: 640 } });

test('Check Detail pages at 320px', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('vilaasa-otp-access', JSON.stringify({ verifiedAt: Date.now() }));
  });

  // Check domestic real estate & first property detail
  await page.goto('http://localhost:8080/domestic/real-estate', { waitUntil: 'networkidle' });
  const firstPropLink = await page.locator('a[href*="/property/"]').first().getAttribute('href');
  console.log('Testing property detail link:', firstPropLink);

  if (firstPropLink) {
    await page.goto(`http://localhost:8080${firstPropLink}`, { waitUntil: 'networkidle' });
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
  }

  // Check domestic franchise & first franchise detail
  await page.goto('http://localhost:8080/domestic/franchise', { waitUntil: 'networkidle' });
  const firstFranLink = await page.locator('a[href*="/franchise/"]').first().getAttribute('href');
  console.log('Testing franchise detail link:', firstFranLink);

  if (firstFranLink) {
    await page.goto(`http://localhost:8080${firstFranLink}`, { waitUntil: 'networkidle' });
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
  }
});
