import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

const property1Data = {
  name: 'Carlton Krillam Wellness Residences',
  tagline: "Live or Lease – Your Villa, Your Choice. This isn't just a villa — it's a second home that earns for you. With guaranteed monthly rent and full property management, it offers peace of mind and steady returns.",
  propertyType: 'Residential Villa',
  status: 'AVAILABLE',
  visionHeadline: 'A Haven of Elegance and Tranquility',
  description: "Carlton Krillam Wellness Residences is India’s first branded wellness real estate destination, thoughtfully developed to blend luxury living, authentic Ayurveda, and long-term wealth creation. Located in Ongole, Andhra Pradesh, the project offers freehold, RERA-approved villas within an integrated wellness township, supported by globally benchmarked wellness standards and professional management.\n\nEach villa is designed not only as a personal sanctuary but also as an income-generating asset. With long-term lease-back assurance, assured monthly income, lifestyle privileges, and capital appreciation potential, Carlton Krillam delivers a rare opportunity to invest in a future-ready wellness ecosystem backed by Sri Sri Panchakarma, Sri Sri Tattva, and a professionally operated hospitality framework.",
  verdictQuote: "Ongol's wellness positioning unlocks strong potential for superior IRR and long-term value creation.",
  verdictAuthor: 'Sanjay Pillai',
  verdictTitle: 'Kerala Market Director',
  specs: [
    { label: 'Property Type', value: 'Freehold Luxury Villas' },
    { label: 'Locations', value: 'Andhra Pradesh' },
    { label: 'Min. Investment', value: '₹2.99 Crore + GST' },
    { label: 'Projected IRR', value: '8–9% annually' },
    { label: 'Industry Growth', value: '6.5% – 8% p.a.' },
  ],
  financials: [
    { label: 'Min. Investment', value: '₹2.99 Cr + GST', note: 'Freehold Wellness Villa Allocation' },
    { label: 'Projected IRR', value: '8–9% p.a.', note: 'Annualized Long-Term Return Horizon' },
    { label: 'Industry Growth', value: '6.5% – 8% p.a.', note: 'Branded Wellness Segment Benchmark' },
  ],
  expectedIrr: '8.5',
  basePrice: '2.99 CR',
  configurations: [
    { unitType: '3 BHK Wellness Villa', areaSqFt: 3500, viewType: 'Wellness Township View', price: '₹2.99 Cr + GST' },
    { unitType: '4 BHK Wellness Villa', areaSqFt: 4500, viewType: 'Ayurvedic Garden View', price: '₹3.66 Cr + GST' },
  ],
  amenities: [
    { name: 'Sri Sri Panchakarma Wellness Centre', description: 'A curated wellness retail experience driving year-round engagement and repeat visits' },
    { name: 'Wellness Boat Club', description: 'A tranquil water-based leisure experience designed for relaxation and mindful living' },
    { name: 'Lifestyle Clubhouse', description: 'A premium social and recreational hub for residents and guests.' },
    { name: 'Private Helipad', description: 'Seamless luxury connectivity for high-net-worth residents and guests.' },
  ],
  location: {
    city: 'Ongole',
    country: 'India',
    community: 'Andhra Pradesh',
    addressLine: 'Carlton Krillam Township, NH-16 Corridor',
  },
  landmarks: [
    { category: 'Airport', name: 'Upcoming Ongole Airport', distance: '8 km', travelTime: '10 minutes', notes: 'Direct airport connectivity' },
    { category: 'Transit', name: 'NH-16 Economic Corridor', distance: '500 m', travelTime: 'Immediate access', notes: 'Primary arterial expressway' },
    { category: 'Beach', name: 'Kanaparthi Beach', distance: '12 km', travelTime: '10–15 minutes', notes: 'Pristine coastal shoreline' },
  ],
};

const property2Data = {
  name: 'OXYGEN FOREST',
  tagline: "Oxygen Forest is not just a real estate development—it is a return to conscious living. Crafted for those who seek purity, privacy, and long-term value, Oxygen Forest offers a rare opportunity to own land within a protected forest ecosystem while enjoying the comforts of a thoughtfully planned luxury community. Surrounded by untouched reserve forest and enriched with organic plantations, this destination blends lifestyle, sustainability, and legacy ownership.",
  propertyType: 'Farmland Plot',
  status: 'AVAILABLE',
  visionHeadline: 'Live in Nature’s Embrace — A Managed Forest Community Just Outside Hyderabad',
  description: "Oxygen Forest redefines luxury living by combining exclusive farmland ownership with immersive nature experiences. Spread across a sprawling 160-acre gated forest estate, this project offers limited, organically enriched land plots surrounded on three sides by over 25,000 acres of pristine reserve forest. Designed for those who value serenity, sustainability, and deep connection with nature, each plot integrates abundant fruit-bearing and forest trees, eco-friendly infrastructure, and premium lifestyle features.\n\nIdeal both as a private retreat and a legacy investment, Oxygen Forest allows owners to build their custom villa on a portion of the land while preserving the rest as green open space. With thoughtfully curated amenities such as a clubhouse, swimming pool, lotus ponds, walking trails, and spiritual spaces, this community blends forest living with the comforts of modern design. This unique property promises not just ownership of land but a life steeped in fresh air, wellness, and tranquility.",
  verdictQuote: "With growing preference for eco-luxury living, Oxygen Forest combines experiential ownership with compelling long-term return potential.",
  verdictAuthor: 'Sanjay Pillai',
  verdictTitle: 'Eco-Luxury Assets Advisory',
  specs: [
    { label: 'Property Type', value: 'Farmland Plot' },
    { label: 'Locations', value: 'Hyderabad' },
    { label: 'Min. Investment', value: '₹49 Lakhs' },
    { label: 'Projected IRR', value: '12% – 18% IRR' },
  ],
  financials: [
    { label: 'Min. Investment', value: '₹49 Lakhs', note: 'Farmland Plot Base Allocation' },
    { label: 'Projected IRR', value: '12% – 18% IRR', note: 'Eco-Luxury Agroforestry Appreciation' },
  ],
  expectedIrr: '15.0',
  basePrice: '₹49 Lakhs',
  configurations: [
    { unitType: 'Farmland Plot (Half Acre)', areaSqFt: 5445, viewType: 'Reserve Forest View', price: '₹49 Lakhs' },
    { unitType: 'Farmland Plot (One Acre)', areaSqFt: 10890, viewType: 'Organic Plantation View', price: '₹79 Lakhs' },
  ],
  amenities: [
    { name: 'Lush Forest Landscapes', description: '25,000+ acres of reserve forest as your backdrop.' },
    { name: 'Exclusive Clubhouse', description: 'A community gathering and relaxation space.' },
    { name: 'Swimming Pool', description: 'Recreation and refreshment amidst green serenity' },
    { name: 'Organic Farm Nursery', description: 'Grow and learn with fruit and forest trees planted per plot.' },
  ],
  location: {
    city: 'Kamareddy Town Center',
    country: 'India',
    community: 'Hyderabad Outskirts',
    addressLine: 'Oxygen Forest Gated Estate, Near Kamareddy',
  },
  landmarks: [
    { category: 'Transit', name: 'Kamareddy Town Center', distance: '15 km', travelTime: '20 Mins Drive', notes: 'Primary commercial hub' },
    { category: 'Transit', name: 'Medchal, Hyderabad', distance: '92 km', travelTime: '75 Mins Drive', notes: 'Direct arterial highway to Hyderabad' },
    { category: 'Metro', name: 'Nearest Railway Station', distance: '7 km', travelTime: '10 Mins Drive', notes: 'Regional rail connectivity' },
  ],
};

async function createPropertyViaUI(page: Page, prop: typeof property1Data) {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting UI Property Creation for: ${prop.name}`);
  console.log(`======================================================`);

  // Navigate to Add Property
  await page.goto(`${BASE_URL}/admin/properties/new`);
  await page.waitForLoadState('networkidle');

  // Ensure sections are expanded
  const expandBtn = page.locator('button', { hasText: 'Expand All' });
  if (await expandBtn.isVisible()) {
    await expandBtn.click();
    await page.waitForTimeout(300);
  }

  // --- SECTION 1: HERO & CORE LISTING ---
  console.log('Filling Section 1: Hero & Core Listing...');
  const domesticBtn = page.locator('#sec-hero button', { hasText: /India/i });
  await domesticBtn.click();

  const nameInput = page.locator('#sec-hero input[placeholder*="Glasshouse"]');
  await nameInput.fill(prop.name);

  const taglineInput = page.locator('#sec-hero textarea[placeholder*="cliffside estate"]');
  await taglineInput.fill(prop.tagline);

  const typeInput = page.locator('#sec-hero input[placeholder*="Residential Villa"]');
  await typeInput.fill(prop.propertyType);

  const statusSelect = page.locator('#sec-hero select');
  await statusSelect.selectOption(prop.status);

  // --- SECTION 2: VISION & EDITORIAL ---
  console.log('Filling Section 2: Vision & Editorial Story...');
  const visionHeadlineInput = page.locator('#sec-vision input[placeholder*="Where architectural mastery"]');
  await visionHeadlineInput.fill(prop.visionHeadline);

  const descTextarea = page.locator('#sec-vision textarea[placeholder*="editorial description"]');
  await descTextarea.fill(prop.description);

  const verdictTextarea = page.locator('#sec-vision textarea[placeholder*="landmark residence redefining"]');
  await verdictTextarea.fill(prop.verdictQuote);

  const authorInput = page.locator('#sec-vision input[placeholder*="Sanjay Pillai"]');
  await authorInput.fill(prop.verdictAuthor);

  const roleInput = page.locator('#sec-vision input[placeholder*="Private Client Acquisitions"]');
  await roleInput.fill(prop.verdictTitle);

  // --- SECTION 3: AT A GLANCE (SPECS) ---
  console.log(`Filling Section 3: Specs (${prop.specs.length} items)...`);
  const addSpecBtn = page.locator('#sec-specs button[title="Add Specification"]');
  for (let i = 0; i < prop.specs.length; i++) {
    await addSpecBtn.click();
    await page.waitForTimeout(200);
  }
  const specCards = page.locator('#sec-specs div.grid > div');
  for (let i = 0; i < prop.specs.length; i++) {
    const card = specCards.nth(i);
    const inputs = card.locator('input');
    await inputs.nth(0).fill(prop.specs[i].label);
    await inputs.nth(1).fill(prop.specs[i].value);
  }

  // --- SECTION 4: FINANCIAL INTELLIGENCE ---
  console.log(`Filling Section 4: Financial Metrics (${prop.financials.length} items)...`);
  const addFinBtn = page.locator('#sec-financials button[title="Add Financial Metric"]');
  for (let i = 0; i < prop.financials.length; i++) {
    await addFinBtn.click();
    await page.waitForTimeout(200);
  }
  const finCards = page.locator('#sec-financials div.grid > div');
  for (let i = 0; i < prop.financials.length; i++) {
    const card = finCards.nth(i);
    const inputs = card.locator('input');
    await inputs.nth(0).fill(prop.financials[i].label);
    await inputs.nth(1).fill(prop.financials[i].value);
    if (prop.financials[i].note) {
      await inputs.nth(2).fill(prop.financials[i].note);
    }
  }

  // --- SECTION 5: PRICING & CONFIGURATIONS ---
  console.log('Filling Section 5: Pricing & Configurations...');
  const currencySelect = page.locator('#sec-pricing select').first();
  await currencySelect.selectOption('INR');

  const priceInput = page.locator('#sec-pricing input[placeholder*="15 Cr"]');
  await priceInput.fill(prop.basePrice);

  if (prop.expectedIrr) {
    const irrInput = page.locator('#sec-pricing input[placeholder*="18.5"]');
    await irrInput.fill(prop.expectedIrr);
  }

  const addConfigBtn = page.locator('#sec-pricing button[title="Add Layout Configuration"]');
  for (let i = 0; i < prop.configurations.length; i++) {
    await addConfigBtn.click();
    await page.waitForTimeout(200);
  }
  const configCards = page.locator('#sec-pricing div.space-y-4 > div');
  for (let i = 0; i < prop.configurations.length; i++) {
    const card = configCards.nth(i);
    const inputs = card.locator('input');
    await inputs.nth(0).fill(prop.configurations[i].unitType);
    await inputs.nth(1).fill(String(prop.configurations[i].areaSqFt));
    await inputs.nth(2).fill(prop.configurations[i].viewType);
    await inputs.nth(3).fill(prop.configurations[i].price);
  }

  // --- SECTION 6: VISUAL SHOWCASE & GALLERY ---
  console.log('Uploading Section 6: Hero / Gallery Image...');
  const fileInput = page.locator('#sec-gallery input[type="file"]');
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  await fileInput.setInputFiles({
    name: `${prop.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_hero.png`,
    mimeType: 'image/png',
    buffer: pngBuffer,
  });
  await page.waitForTimeout(4000);

  // --- SECTION 7: AMENITIES ---
  console.log(`Filling Section 7: Amenities (${prop.amenities.length} items)...`);
  const addAmenityBtn = page.locator('#sec-amenities button[title="Add Amenity"]');
  for (let i = 0; i < prop.amenities.length; i++) {
    await addAmenityBtn.click();
    await page.waitForTimeout(200);
  }
  const amenityCards = page.locator('#sec-amenities div.grid > div');
  for (let i = 0; i < prop.amenities.length; i++) {
    const card = amenityCards.nth(i);
    const inputs = card.locator('input');
    await inputs.nth(0).fill(prop.amenities[i].name);
    if (prop.amenities[i].description) {
      await inputs.nth(1).fill(prop.amenities[i].description);
    }
  }

  // --- SECTION 8: LOCATION & CONNECTIVITY ---
  console.log('Filling Section 8: Location & Landmarks...');
  const cityInput = page.locator('#sec-location input[placeholder*="Goa"], #sec-location input[placeholder*="Dubai"]').first();
  await cityInput.fill(prop.location.city);

  const countryInput = page.locator('#sec-location input[placeholder*="India"], #sec-location input[placeholder*="United Arab Emirates"]').first();
  await countryInput.fill(prop.location.country);

  const communityInput = page.locator('#sec-location input[placeholder*="Candolim"], #sec-location input[placeholder*="Palm Jumeirah"]').first();
  await communityInput.fill(prop.location.community);

  const addressInput = page.locator('#sec-location input[placeholder*="Coastal Highway"]').first();
  await addressInput.fill(prop.location.addressLine);

  // Add Landmarks
  const addLandmarkBtn = page.locator('#sec-location button[title="Add Landmark"]');
  for (let i = 0; i < prop.landmarks.length; i++) {
    await addLandmarkBtn.click();
    await page.waitForTimeout(200);
  }
  const landmarkCards = page.locator('#sec-location div.space-y-4 > div');
  for (let i = 0; i < prop.landmarks.length; i++) {
    const card = landmarkCards.nth(i);
    const catSelect = card.locator('select');
    await catSelect.selectOption(prop.landmarks[i].category);
    const inputs = card.locator('input');
    await inputs.nth(0).fill(prop.landmarks[i].name);
    await inputs.nth(1).fill(prop.landmarks[i].distance);
    await inputs.nth(2).fill(prop.landmarks[i].travelTime);
    if (prop.landmarks[i].notes) {
      await inputs.nth(3).fill(prop.landmarks[i].notes);
    }
  }

  // --- SUBMIT PROPERTY ---
  console.log('Submitting property form...');
  const saveBtn = page.getByRole('button', { name: /Create Property/i }).first();
  await saveBtn.click();

  // Wait for redirect to /admin/properties
  await page.waitForURL((url) => url.pathname.includes('/admin/properties'), { timeout: 20000 });
  console.log(`🎉 SUCCESS: ${prop.name} created and redirected to admin properties table!`);

  // Wait for list to load and verify visibility
  await page.waitForTimeout(1500);
  const propertyListing = page.locator(`text=${prop.name}`).first();
  await expect(propertyListing).toBeVisible({ timeout: 10000 });
  console.log(`✅ VERIFIED: "${prop.name}" is visible in the Admin Properties Portfolio!`);
}

test.describe('Vilaasa Real Estate — Playwright Property Insertion', () => {
  test.setTimeout(180000);

  test('Log in and add Carlton Krillam & Oxygen Forest properties', async ({ page }) => {
    // 1. Log in to Admin Panel
    console.log('Logging in as superadmin@vilaasa.com...');
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('#email', 'superadmin@vilaasa.com');
    await page.fill('#pass', 'SuperAdmin@Vilaasa2026');
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => url.pathname.includes('/admin/'), { timeout: 15000 });
    console.log('✅ Logged in successfully!');

    // 2. Add Property 1: Carlton Krillam Wellness Residences
    await createPropertyViaUI(page, property1Data);

    // 3. Add Property 2: OXYGEN FOREST
    await createPropertyViaUI(page, property2Data);

    console.log('\n======================================================');
    console.log('🎉 ALL PROPERTIES SUCCESSFULLY CREATED VIA PLAYWRIGHT!');
    console.log('======================================================\n');
  });
});
