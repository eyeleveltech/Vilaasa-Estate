export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  orderIndex: number;
  isHero?: boolean;
}

export interface MetricBadge {
  id: string;
  label: string;
  value: string;
}

export interface SupportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface BenefitCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FranchisePageData {
  pageTitle: string;
  mainHeadline: string;
  subheading: string;
  heroImage?: string;

  // Dynamic Array Lists
  heroMetrics: MetricBadge[];
  blueprintMetrics: MetricBadge[];
  ecosystemCards: SupportCard[];
  benefitCards: BenefitCard[];

  // Legacy flat fields for backward compatibility
  metric1Label?: string;
  metric1Value?: string;
  metric2Label?: string;
  metric2Value?: string;
  metric3Label?: string;
  metric3Value?: string;
  metric4Label?: string;
  metric4Value?: string;

  visionHeadline: string;
  visionDescription: string;

  metric5Label?: string;
  metric5Value?: string;
  metric6Label?: string;
  metric6Value?: string;
  metric7Label?: string;
  metric7Value?: string;
  metric8Label?: string;
  metric8Value?: string;

  ecosystemSubheading: string;
  ecosystemHeading: string;
  ecosystemDescription: string;

  support1Title?: string;
  support1Description?: string;
  support1Icon?: string;
  support2Title?: string;
  support2Description?: string;
  support2Icon?: string;
  support3Title?: string;
  support3Description?: string;
  support3Icon?: string;
  support4Title?: string;
  support4Description?: string;
  support4Icon?: string;

  benefitsSubheading: string;
  benefitsDescription: string;

  benefit1Title?: string;
  benefit1Description?: string;
  benefit1Icon?: string;
  benefit2Title?: string;
  benefit2Description?: string;
  benefit2Icon?: string;
  benefit3Title?: string;
  benefit3Description?: string;
  benefit3Icon?: string;

  galleryImages: GalleryItem[];
}

export const HERO_PLACEHOLDERS = [
  { label: 'e.g. MIN. INVESTMENT', value: 'e.g. ₹3.5 Cr' },
  { label: 'e.g. ANNUAL ROI', value: 'e.g. 24% - 30%' },
  { label: 'e.g. PAYBACK PERIOD', value: 'e.g. 3 Years' },
  { label: 'e.g. MODEL', value: 'e.g. FOCO' },
];

export const BLUEPRINT_PLACEHOLDERS = [
  { label: 'e.g. TOTAL PROJECT COST', value: 'e.g. ₹12 Cr' },
  { label: 'e.g. MIN. TICKET SIZE', value: 'e.g. ₹3.5 Cr' },
  { label: 'e.g. LOCK-IN PERIOD', value: 'e.g. 60 Months' },
  { label: 'e.g. YIELD PAYOUT', value: 'e.g. Quarterly' },
];

export const ECOSYSTEM_PLACEHOLDERS = [
  {
    title: 'e.g. Location Scouting',
    description: 'e.g. AI-driven demographic density analysis, footfall mapping, and prime high-street commercial leasing advisory.',
  },
  {
    title: 'e.g. Architecture & Interior Design',
    description: 'e.g. End-to-end biophilic sanctuary blueprints, luxury material sourcing, and turnkey contractor supervision.',
  },
  {
    title: 'e.g. Staff & Therapist Training',
    description: 'e.g. Certified Vedic master training, clinical hygiene protocol implementation, and guest experience benchmarks.',
  },
  {
    title: 'e.g. Global Marketing & PR',
    description: 'e.g. Ultra-high-net-worth targeted digital acquisition, luxury lifestyle influencer placements, and launch events.',
  },
];

export const BENEFIT_PLACEHOLDERS = [
  {
    title: 'e.g. 100% Hands-Off Operations',
    description: 'e.g. Master operating partner runs all daily staffing, guest hospitality, and licensing. You receive passive net yield disbursements.',
  },
  {
    title: 'e.g. Institutional Brand Power',
    description: 'e.g. Immediate brand prestige with an established global reputation, recurring VIP memberships, and international client retention.',
  },
  {
    title: 'e.g. Capital Protection & Escrow',
    description: 'e.g. Institutional governance with escrow-backed capex reserves, RERA registered leases, and transparent quarterly audited books.',
  },
];

export const DEFAULT_PAGE_DATA: FranchisePageData = {
  pageTitle: '',
  mainHeadline: '',
  subheading: '',
  heroImage: '',

  heroMetrics: [
    { id: 'hero-1', label: '', value: '' },
    { id: 'hero-2', label: '', value: '' },
    { id: 'hero-3', label: '', value: '' },
    { id: 'hero-4', label: '', value: '' },
  ],

  visionHeadline: '',
  visionDescription: '',

  blueprintMetrics: [
    { id: 'bp-1', label: '', value: '' },
    { id: 'bp-2', label: '', value: '' },
    { id: 'bp-3', label: '', value: '' },
    { id: 'bp-4', label: '', value: '' },
  ],

  ecosystemSubheading: '',
  ecosystemHeading: '',
  ecosystemDescription: '',
  ecosystemCards: [
    { id: 'eco-1', title: '', description: '', icon: 'storefront' },
    { id: 'eco-2', title: '', description: '', icon: 'design_services' },
    { id: 'eco-3', title: '', description: '', icon: 'school' },
    { id: 'eco-4', title: '', description: '', icon: 'campaign' },
  ],

  benefitsSubheading: '',
  benefitsDescription: '',
  benefitCards: [
    { id: 'ben-1', title: '', description: '', icon: 'volunteer_activism' },
    { id: 'ben-2', title: '', description: '', icon: 'shield' },
    { id: 'ben-3', title: '', description: '', icon: 'trending_up' },
  ],

  galleryImages: [],
};

export const COMMON_ICONS = [
  'storefront',
  'design_services',
  'school',
  'campaign',
  'volunteer_activism',
  'shield',
  'trending_up',
  'spa',
  'restaurant',
  'verified',
  'payments',
  'groups',
  'hotel',
  'health_and_safety',
];

export const detectIconFromKeyword = (text: string, defaultIcon: string): string => {
  const lower = text.toLowerCase();
  if (/location|site|land|scout|place|geo|city|map|destination|territory/.test(lower)) return 'storefront';
  if (/architect|design|interior|biophilic|decor|layout|plan|build|styling|blueprint/.test(lower)) return 'design_services';
  if (/train|staff|team|ayurveda|therapist|school|learn|academy|doctor|specialist|faculty/.test(lower)) return 'school';
  if (/market|brand|pr|global|campaign|promote|media|advisory|outreach|social|ad/.test(lower)) return 'campaign';
  if (/hands-off|passive|manage|operat|turnkey|foco|automation|executive|oversight/.test(lower)) return 'volunteer_activism';
  if (/escrow|secur|protect|guarantee|safe|trust|legal|rera|audit|compliance|covenant/.test(lower)) return 'shield';
  if (/return|roi|yield|profit|payout|dividend|growth|capital|wealth|cash|appreciation/.test(lower)) return 'trending_up';
  if (/spa|wellness|resort|hotel|hospitality|heal|guest|retreat|sanctuary|suite/.test(lower)) return 'spa';
  if (/food|dine|culinary|chef|restaurant|cafe|bar|kitchen|gastronomy/.test(lower)) return 'restaurant';
  if (/certif|quality|award|standard|accredit|grade|iso|star/.test(lower)) return 'verified';
  return defaultIcon;
};

/**
 * Automatically converts currency shortcuts (e.g. "inr", "rs", "rupee", "usd", "eur", "gbp")
 * into their proper symbols (e.g. "₹", "$", "€", "£").
 */
export const autoFormatCurrencySymbol = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/(?:^|\b)(inr|rs\.?|rupees?)(?:\s*|(?=\d))/gi, '₹')
    .replace(/(?:^|\b)(usd|dollars?)(?:\s*|(?=\d))/gi, '$')
    .replace(/(?:^|\b)(eur|euros?)(?:\s*|(?=\d))/gi, '€')
    .replace(/(?:^|\b)(gbp|pounds?)(?:\s*|(?=\d))/gi, '£')
    .replace(/(?:^|\b)(aed|dirhams?)(?:\s*|(?=\d))/gi, 'AED ');
};

/**
 * Normalizes page data to ensure dynamic arrays are always valid arrays,
 * converting legacy flat fields if array is missing or empty.
 */
export const normalizeFranchisePageData = (
  raw: Partial<FranchisePageData> | null | undefined
): FranchisePageData => {
  if (!raw) return { ...DEFAULT_PAGE_DATA };

  // 1. Hero Metrics
  let heroMetrics: MetricBadge[] = [];
  if (Array.isArray(raw.heroMetrics) && raw.heroMetrics.length > 0) {
    heroMetrics = raw.heroMetrics;
  } else {
    // Check legacy fields
    const legacyHero: MetricBadge[] = [];
    if (raw.metric1Label || raw.metric1Value) {
      legacyHero.push({ id: 'h1', label: raw.metric1Label || 'MIN. INVESTMENT', value: raw.metric1Value || '' });
    }
    if (raw.metric2Label || raw.metric2Value) {
      legacyHero.push({ id: 'h2', label: raw.metric2Label || 'ANNUAL ROI', value: raw.metric2Value || '' });
    }
    if (raw.metric3Label || raw.metric3Value) {
      legacyHero.push({ id: 'h3', label: raw.metric3Label || 'PAYBACK PERIOD', value: raw.metric3Value || '' });
    }
    if (raw.metric4Label || raw.metric4Value) {
      legacyHero.push({ id: 'h4', label: raw.metric4Label || 'MODEL', value: raw.metric4Value || '' });
    }
    heroMetrics = legacyHero.length > 0 ? legacyHero : DEFAULT_PAGE_DATA.heroMetrics;
  }

  // 2. Blueprint Metrics
  let blueprintMetrics: MetricBadge[] = [];
  if (Array.isArray(raw.blueprintMetrics) && raw.blueprintMetrics.length > 0) {
    blueprintMetrics = raw.blueprintMetrics;
  } else {
    const legacyBp: MetricBadge[] = [];
    if (raw.metric5Label || raw.metric5Value) {
      legacyBp.push({ id: 'bp1', label: raw.metric5Label || 'TOTAL PROJECT COST', value: raw.metric5Value || '' });
    }
    if (raw.metric6Label || raw.metric6Value) {
      legacyBp.push({ id: 'bp2', label: raw.metric6Label || 'MIN. TICKET SIZE', value: raw.metric6Value || '' });
    }
    if (raw.metric7Label || raw.metric7Value) {
      legacyBp.push({ id: 'bp3', label: raw.metric7Label || 'LOCK-IN PERIOD', value: raw.metric7Value || '' });
    }
    if (raw.metric8Label || raw.metric8Value) {
      legacyBp.push({ id: 'bp4', label: raw.metric8Label || 'YIELD PAYOUT', value: raw.metric8Value || '' });
    }
    blueprintMetrics = legacyBp.length > 0 ? legacyBp : DEFAULT_PAGE_DATA.blueprintMetrics;
  }

  // 3. Ecosystem Cards
  let ecosystemCards: SupportCard[] = [];
  if (Array.isArray(raw.ecosystemCards) && raw.ecosystemCards.length > 0) {
    ecosystemCards = raw.ecosystemCards;
  } else {
    const legacyEco: SupportCard[] = [];
    if (raw.support1Title) {
      legacyEco.push({
        id: 'eco1',
        title: raw.support1Title,
        description: raw.support1Description || '',
        icon: raw.support1Icon || 'storefront',
      });
    }
    if (raw.support2Title) {
      legacyEco.push({
        id: 'eco2',
        title: raw.support2Title,
        description: raw.support2Description || '',
        icon: raw.support2Icon || 'design_services',
      });
    }
    if (raw.support3Title) {
      legacyEco.push({
        id: 'eco3',
        title: raw.support3Title,
        description: raw.support3Description || '',
        icon: raw.support3Icon || 'school',
      });
    }
    if (raw.support4Title) {
      legacyEco.push({
        id: 'eco4',
        title: raw.support4Title,
        description: raw.support4Description || '',
        icon: raw.support4Icon || 'campaign',
      });
    }
    ecosystemCards = legacyEco.length > 0 ? legacyEco : DEFAULT_PAGE_DATA.ecosystemCards;
  }

  // 4. Benefit Cards
  let benefitCards: BenefitCard[] = [];
  if (Array.isArray(raw.benefitCards) && raw.benefitCards.length > 0) {
    benefitCards = raw.benefitCards;
  } else {
    const legacyBen: BenefitCard[] = [];
    if (raw.benefit1Title) {
      legacyBen.push({
        id: 'ben1',
        title: raw.benefit1Title,
        description: raw.benefit1Description || '',
        icon: raw.benefit1Icon || 'volunteer_activism',
      });
    }
    if (raw.benefit2Title) {
      legacyBen.push({
        id: 'ben2',
        title: raw.benefit2Title,
        description: raw.benefit2Description || '',
        icon: raw.benefit2Icon || 'shield',
      });
    }
    if (raw.benefit3Title) {
      legacyBen.push({
        id: 'ben3',
        title: raw.benefit3Title,
        description: raw.benefit3Description || '',
        icon: raw.benefit3Icon || 'trending_up',
      });
    }
    benefitCards = legacyBen.length > 0 ? legacyBen : DEFAULT_PAGE_DATA.benefitCards;
  }

  // 5. Gallery Images & Hero Image Sync
  const rawGallery = Array.isArray(raw.galleryImages) ? raw.galleryImages : [];
  const heroImage = raw.heroImage || rawGallery.find((g) => g.isHero)?.url || '';
  const galleryImages: GalleryItem[] = rawGallery.map((g) => ({
    ...g,
    isHero: Boolean(g.isHero || (heroImage && g.url === heroImage)),
  }));

  return {
    ...DEFAULT_PAGE_DATA,
    ...raw,
    heroImage,
    heroMetrics,
    blueprintMetrics,
    ecosystemCards,
    benefitCards,
    galleryImages,
  };
};

/**
 * Prepares payload for saving by populating both dynamic arrays and legacy fields.
 */
export const prepareFranchisePagePayload = (data: FranchisePageData): FranchisePageData => {
  const heroItem = data.galleryImages.find((g) => g.isHero);
  const heroImage = heroItem?.url || data.heroImage || (data.galleryImages[0]?.url || '');

  const payload: FranchisePageData = {
    ...data,
    heroImage,
    metric1Label: data.heroMetrics[0]?.label || '',
    metric1Value: data.heroMetrics[0]?.value || '',
    metric2Label: data.heroMetrics[1]?.label || '',
    metric2Value: data.heroMetrics[1]?.value || '',
    metric3Label: data.heroMetrics[2]?.label || '',
    metric3Value: data.heroMetrics[2]?.value || '',
    metric4Label: data.heroMetrics[3]?.label || '',
    metric4Value: data.heroMetrics[3]?.value || '',

    metric5Label: data.blueprintMetrics[0]?.label || '',
    metric5Value: data.blueprintMetrics[0]?.value || '',
    metric6Label: data.blueprintMetrics[1]?.label || '',
    metric6Value: data.blueprintMetrics[1]?.value || '',
    metric7Label: data.blueprintMetrics[2]?.label || '',
    metric7Value: data.blueprintMetrics[2]?.value || '',
    metric8Label: data.blueprintMetrics[3]?.label || '',
    metric8Value: data.blueprintMetrics[3]?.value || '',

    support1Title: data.ecosystemCards[0]?.title || '',
    support1Description: data.ecosystemCards[0]?.description || '',
    support1Icon: data.ecosystemCards[0]?.icon || 'storefront',
    support2Title: data.ecosystemCards[1]?.title || '',
    support2Description: data.ecosystemCards[1]?.description || '',
    support2Icon: data.ecosystemCards[1]?.icon || 'design_services',
    support3Title: data.ecosystemCards[2]?.title || '',
    support3Description: data.ecosystemCards[2]?.description || '',
    support3Icon: data.ecosystemCards[2]?.icon || 'school',
    support4Title: data.ecosystemCards[3]?.title || '',
    support4Description: data.ecosystemCards[3]?.description || '',
    support4Icon: data.ecosystemCards[3]?.icon || 'campaign',

    benefit1Title: data.benefitCards[0]?.title || '',
    benefit1Description: data.benefitCards[0]?.description || '',
    benefit1Icon: data.benefitCards[0]?.icon || 'volunteer_activism',
    benefit2Title: data.benefitCards[1]?.title || '',
    benefit2Description: data.benefitCards[1]?.description || '',
    benefit2Icon: data.benefitCards[1]?.icon || 'shield',
    benefit3Title: data.benefitCards[2]?.title || '',
    benefit3Description: data.benefitCards[2]?.description || '',
    benefit3Icon: data.benefitCards[2]?.icon || 'trending_up',
  };

  return payload;
};
