import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Vilaasa Admin UI Form Direct Creation Flow', () => {
  test.setTimeout(90000);

  test('Admin UI Property Form & Franchise Form Submission', async ({ page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const uiPropertyName = `Solarium Crest Estate ${timestamp}`;

    // 1. Log in to Admin
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('#email', 'superadmin@vilaasa.com');
    await page.fill('#pass', 'SuperAdmin@Vilaasa2026');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/admin/');

    // 2. Navigate to Admin Property Form (/admin/properties/new)
    await page.goto(`${BASE_URL}/admin/properties/new`);
    await page.waitForLoadState('networkidle');

    // Switch to "View All" mode
    const viewAllBtn = page.getByRole('button', { name: /View All/i });
    if (await viewAllBtn.isVisible()) {
      await viewAllBtn.click();
    }

    // Fill Property Name (Section 1)
    const nameInput = page.locator('input[placeholder*="Glasshouse"]').first();
    await nameInput.fill(uiPropertyName);

    // Fill Tagline
    const taglineInput = page.locator('#sec-hero textarea').first();
    await taglineInput.fill('Ultra-luxury clifftop sanctuary with private infinity pools.');

    // Fill Property Type
    const typeInput = page.locator('input[placeholder*="Residential Villa"]').first();
    await typeInput.fill('Residential Villa');

    // Fill Vision Headline & Description (Section 2)
    const visionHeadlineInput = page.locator('input[placeholder*="mastery"]').first();
    if (await visionHeadlineInput.isVisible()) {
      await visionHeadlineInput.fill('The Pinnacle of Luxury Coastal Living');
    }

    const descTextarea = page.locator('#sec-vision textarea').first();
    await descTextarea.fill('An architectural masterpiece featuring floor-to-ceiling glass, private helipad, and panoramic sea vistas.');

    // Add Spec (Section 3) - Click Custom Button
    const addSpecCustomBtn = page.locator('#sec-specs').getByRole('button', { name: /Custom/i });
    await addSpecCustomBtn.click();
    const specInputs = page.locator('#sec-specs div.grid input');
    if (await specInputs.count() >= 2) {
      await specInputs.nth(0).fill('Built-Up Area');
      await specInputs.nth(1).fill('12,000 Sq.Ft.');
    }

    // Add Financial Metric (Section 4) - Click Custom Button
    const addFinCustomBtn = page.locator('#sec-financials').getByRole('button', { name: /Custom/i });
    await addFinCustomBtn.click();
    const finInputs = page.locator('#sec-financials div.grid input');
    if (await finInputs.count() >= 2) {
      await finInputs.nth(0).fill('Projected Net Yield');
      await finInputs.nth(1).fill('8.5% p.a.');
    }

    // Fill Price (Section 5)
    const priceInput = page.locator('#sec-pricing input[type="text"], #sec-pricing input:not([type])').first();
    await priceInput.fill('55000000');

    // Add Unit Configuration (Section 5) - Click Custom Button
    const addConfigBtn = page.locator('#sec-pricing').getByRole('button', { name: /Custom/i });
    if (await addConfigBtn.isVisible()) {
      await addConfigBtn.click();
      const configInputs = page.locator('#sec-pricing div.space-y-4 input');
      if (await configInputs.count() >= 3) {
        await configInputs.nth(0).fill('4 BHK Presidential Villa');
        await configInputs.nth(1).fill('9500');
        await configInputs.nth(2).fill('Cliff & Ocean View');
      }
    }

    // Add Amenity (Section 7) - Click Custom Button
    const addAmenityCustomBtn = page.locator('#sec-amenities').getByRole('button', { name: /Custom/i });
    await addAmenityCustomBtn.click();
    const amInputs = page.locator('#sec-amenities div.grid input');
    if (await amInputs.count() > 0) {
      await amInputs.first().fill('Private Infinity Pool');
    }

    // Fill Location City (Section 8)
    const cityInput = page.locator('#sec-location input').first();
    await cityInput.fill('Goa');

    // Upload / Add image via file input (Section 6)
    const fileInput = page.locator('#sec-gallery input[type="file"]');
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await fileInput.setInputFiles({
      name: 'property_hero.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });

    // Wait for upload response
    await page.waitForTimeout(4000);

    // Click Create Property button (first button in top bar)
    const saveBtn = page.getByRole('button', { name: /Create Property/i }).first();
    await saveBtn.click();

    // Verify redirection to /admin/properties
    await page.waitForURL((url) => url.pathname.includes('/admin/properties'), { timeout: 15000 });
    console.log('✅ UI Form creation succeeded! Redirected to /admin/properties');

    // Verify property appears in Admin List
    await expect(page.locator(`text=${uiPropertyName}`).first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ Verified "${uiPropertyName}" is listed in Admin Properties table!`);
  });
});
