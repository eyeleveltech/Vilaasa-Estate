import { prisma } from '../src/config/db';
import { InquiryStatus, LeadSource, Currency } from '@prisma/client';

async function main() {
  console.log('🚀 Starting Client-Ready Data Sanitization and Seeding...');

  // 1. Fetch active properties to link leads and site visits
  const activeProperties = await prisma.property.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true, type: true, currency: true },
  });

  const taiyo = activeProperties.find((p) => p.name.includes('Taiyo')) || activeProperties[0];
  const carlton = activeProperties.find((p) => p.name.includes('Carlton')) || activeProperties[0];
  const krillam = activeProperties.find((p) => p.name.includes('Krillam Marine')) || activeProperties[0];
  const wellnessFranchise = activeProperties.find((p) => p.type === 'FRANCHISE') || activeProperties[0];

  console.log(`Active properties identified:`, {
    taiyo: taiyo?.name,
    carlton: carlton?.name,
    krillam: krillam?.name,
    wellnessFranchise: wellnessFranchise?.name,
  });

  // 2. Remove all test-related site visits
  const deletedVisits = await prisma.siteVisit.deleteMany({
    where: {
      OR: [
        { name: { contains: 'test', mode: 'insensitive' } },
        { email: { contains: 'test', mode: 'insensitive' } },
        { email: { contains: 'conflict', mode: 'insensitive' } },
        { email: { contains: 'slug', mode: 'insensitive' } },
        { notes: { contains: 'test', mode: 'insensitive' } },
        { notes: { contains: 'conflict', mode: 'insensitive' } },
        { notes: { contains: 'slug', mode: 'insensitive' } },
      ],
    },
  });
  console.log(`🧹 Deleted ${deletedVisits.count} test site visit records.`);

  // 3. Remove all test-related inquiries
  const testInquiries = await prisma.inquiry.findMany({
    where: {
      OR: [
        { name: { contains: 'test', mode: 'insensitive' } },
        { email: { contains: 'test', mode: 'insensitive' } },
        { email: { contains: 'conflict', mode: 'insensitive' } },
        { email: { contains: 'slug', mode: 'insensitive' } },
        { notes: { contains: 'test', mode: 'insensitive' } },
        { notes: { contains: 'conflict', mode: 'insensitive' } },
        { notes: { contains: 'slug', mode: 'insensitive' } },
      ],
    },
    select: { id: true },
  });

  const testInquiryIds = testInquiries.map((i) => i.id);
  if (testInquiryIds.length > 0) {
    await prisma.inquiryTimeline.deleteMany({
      where: { inquiryId: { in: testInquiryIds } },
    });
    const deletedInqs = await prisma.inquiry.deleteMany({
      where: { id: { in: testInquiryIds } },
    });
    console.log(`🧹 Deleted ${deletedInqs.count} test inquiry records.`);
  }

  // 4. Remove dummy test users (keeping core superadmin and partners)
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: 'otp.test', mode: 'insensitive' } },
        { email: { contains: 'test.investor', mode: 'insensitive' } },
        { email: { contains: 'test.conflict', mode: 'insensitive' } },
      ],
    },
  });
  console.log(`🧹 Deleted ${deletedUsers.count} test user accounts.`);

  // Current anchor date (September 2026)
  const today = new Date('2026-09-09T10:00:00.000Z');

  // 5. Seed Authentic VIP Site Inspections
  const vipSiteVisits = [
    {
      propertyId: taiyo.id,
      name: 'Dr. Aisha Al-Nuaimi',
      email: 'aisha.alnuaimi@emiratescapital.ae',
      phone: '+971 50 882 1943',
      scheduledDate: new Date('2026-09-11T11:00:00.000Z'),
      scheduledTime: '11:00 AM',
      timezone: 'Asia/Dubai',
      visitType: 'real-estate-international',
      status: 'CONFIRMED',
      notes: 'VIP Chauffeur service requested from Burj Al Arab. Private penthouse floor plan review.',
    },
    {
      propertyId: carlton.id,
      name: 'Rajesh & Sunita Singhania',
      email: 'r.singhania@singhaniagroup.in',
      phone: '+91 98201 44552',
      scheduledDate: new Date('2026-09-12T14:30:00.000Z'),
      scheduledTime: '02:30 PM',
      timezone: 'Asia/Kolkata',
      visitType: 'real-estate-india',
      status: 'CONFIRMED',
      notes: 'Ayurvedic wellness center tour & private villa sanctuary inspection with principal architect.',
    },
    {
      propertyId: wellnessFranchise.id,
      name: 'Vikramaditya Oberoi',
      email: 'vikram.oberoi@oberoiholdings.com',
      phone: '+91 98110 33921',
      scheduledDate: new Date('2026-09-14T10:30:00.000Z'),
      scheduledTime: '10:30 AM',
      timezone: 'Asia/Kolkata',
      visitType: 'real-estate-india',
      status: 'CONFIRMED',
      notes: 'FOCO franchise institutional partnership review. On-site inspection of retreat premises.',
    },
    {
      propertyId: taiyo.id,
      name: 'Marcus Sterling',
      email: 'm.sterling@mayfairpartners.co.uk',
      phone: '+44 7700 900342',
      scheduledDate: new Date('2026-09-15T16:00:00.000Z'),
      scheduledTime: '04:00 PM',
      timezone: 'Asia/Dubai',
      visitType: 'real-estate-international',
      status: 'CONFIRMED',
      notes: 'Interested in multi-unit bulk acquisition for private UK family trust.',
    },
    {
      propertyId: krillam.id,
      name: 'Kavita Krishnamurthy',
      email: 'kavita.k@zenithadvisors.in',
      phone: '+91 99450 78120',
      scheduledDate: new Date('2026-09-16T12:00:00.000Z'),
      scheduledTime: '12:00 PM',
      timezone: 'Asia/Kolkata',
      visitType: 'real-estate-india',
      status: 'CONFIRMED',
      notes: 'Private waterfront inspection. Seeking high-yield holiday retreat villa.',
    },
  ];

  for (const visit of vipSiteVisits) {
    await prisma.siteVisit.create({ data: visit });
  }
  console.log(`✨ Seeded ${vipSiteVisits.length} VIP site inspections.`);

  // 6. Seed Luxury Inquiries Pipeline with Real Stages and Timelines
  const vipInquiries = [
    {
      name: 'Dr. Aisha Al-Nuaimi',
      email: 'aisha.alnuaimi@emiratescapital.ae',
      phone: '+971 50 882 1943',
      investmentType: 'real-estate',
      investmentRange: 'AED 1.5M - 3M',
      currency: Currency.AED,
      status: InquiryStatus.SITE_VISIT_SCHEDULED,
      source: LeadSource.DIRECT_CALL,
      notes: 'High-intent private investor seeking waterfront luxury apartment. Requested dedicated portfolio dossier.',
      followUpDate: new Date('2026-09-11T11:00:00.000Z'),
      followUpNotes: 'Private viewing confirmed for 11:00 AM on September 11.',
      propertyId: taiyo.id,
      timeline: [
        { fromStatus: null, toStatus: 'NEW', note: 'Inquiry received via private concierge phone channel.' },
        { fromStatus: 'NEW', toStatus: 'CONTACTED', note: 'Executive client partner initiated confidential consultation.' },
        { fromStatus: 'CONTACTED', toStatus: 'QUALIFIED', note: 'KYC & investor net-worth tier verified (> $10M liquid).' },
        { fromStatus: 'QUALIFIED', toStatus: 'SITE_VISIT_SCHEDULED', note: 'VIP Site viewing scheduled for Dubai Taiyo collection.' },
      ],
    },
    {
      name: 'Rajesh & Sunita Singhania',
      email: 'r.singhania@singhaniagroup.in',
      phone: '+91 98201 44552',
      investmentType: 'real-estate',
      investmentRange: '₹25 Cr - ₹35 Cr',
      currency: Currency.INR,
      status: InquiryStatus.SITE_VISIT_SCHEDULED,
      source: LeadSource.HERO_INQUIRY,
      notes: 'Prominent industrialist family seeking generational wellness retreat in South India.',
      followUpDate: new Date('2026-09-12T14:30:00.000Z'),
      followUpNotes: 'Architectural walk-through scheduled with lead developer.',
      propertyId: carlton.id,
      timeline: [
        { fromStatus: null, toStatus: 'NEW', note: 'Web portal private inquiry submitted.' },
        { fromStatus: 'NEW', toStatus: 'QUALIFIED', note: 'Family office credentials vetted and verified.' },
        { fromStatus: 'QUALIFIED', toStatus: 'SITE_VISIT_SCHEDULED', note: 'Executive helicopter transfer confirmed for site viewing.' },
      ],
    },
    {
      name: 'Vikramaditya Oberoi',
      email: 'vikram.oberoi@oberoiholdings.com',
      phone: '+91 98110 33921',
      investmentType: 'franchise',
      investmentRange: '₹35 Cr',
      currency: Currency.INR,
      status: InquiryStatus.NEGOTIATING,
      source: LeadSource.CHANNEL_PARTNER,
      notes: 'Institutional hospitality investor evaluating 100% equity FOCO model in Wayanad Wellness asset.',
      followUpDate: new Date('2026-09-14T10:30:00.000Z'),
      followUpNotes: 'Term sheet and projected yield schedule under legal review.',
      propertyId: wellnessFranchise.id,
      timeline: [
        { fromStatus: null, toStatus: 'NEW', note: 'Channel partner Apex Global referred institutional lead.' },
        { fromStatus: 'NEW', toStatus: 'QUALIFIED', note: 'Proof of funds verified for ₹35 Cr allocation.' },
        { fromStatus: 'QUALIFIED', toStatus: 'NEGOTIATING', note: 'Draft FOCO commercial agreement sent to client legal counsel.' },
      ],
    },
    {
      name: 'Marcus Sterling',
      email: 'm.sterling@mayfairpartners.co.uk',
      phone: '+44 7700 900342',
      investmentType: 'real-estate',
      investmentRange: 'AED 3M - 5M',
      currency: Currency.AED,
      status: InquiryStatus.QUALIFIED,
      source: LeadSource.BROCHURE_DOWNLOAD,
      notes: 'London-based hedge fund principal. Interested in golden visa residency and capital appreciation.',
      followUpDate: new Date('2026-09-15T16:00:00.000Z'),
      followUpNotes: 'Send comparative rental yield report for Dubai Marina vs Taiyo.',
      propertyId: taiyo.id,
      timeline: [
        { fromStatus: null, toStatus: 'NEW', note: 'Downloaded executive investment dossier.' },
        { fromStatus: 'NEW', toStatus: 'CONTACTED', note: 'Completed intro video call via international desk.' },
        { fromStatus: 'CONTACTED', toStatus: 'QUALIFIED', note: 'Confirmed high-net-worth investor status.' },
      ],
    },
    {
      name: 'Kavita Krishnamurthy',
      email: 'kavita.k@zenithadvisors.in',
      phone: '+91 99450 78120',
      investmentType: 'real-estate',
      investmentRange: '₹4 Cr - ₹8 Cr',
      currency: Currency.INR,
      status: InquiryStatus.SITE_VISIT_SCHEDULED,
      source: LeadSource.SCHEDULE_VIEWING_MODAL,
      notes: 'Senior partner at national consultancy. Seeking private waterfront holiday estate.',
      followUpDate: new Date('2026-09-16T12:00:00.000Z'),
      followUpNotes: 'Site inspection booked for 12:00 PM.',
      propertyId: krillam.id,
      timeline: [
        { fromStatus: null, toStatus: 'NEW', note: 'Private viewing scheduled via online portal.' },
        { fromStatus: 'NEW', toStatus: 'SITE_VISIT_SCHEDULED', note: 'Date and concierge slot locked.' },
      ],
    },
    {
      name: 'Tariq Al-Hashemi',
      email: 'tariq.hashemi@dubaiprivatewealth.ae',
      phone: '+971 52 449 8810',
      investmentType: 'real-estate',
      investmentRange: 'AED 2M - 4M',
      currency: Currency.AED,
      status: InquiryStatus.CLOSED_WON,
      source: LeadSource.DIRECT_CALL,
      notes: 'Acquisition finalized for Taiyo luxury unit. Sale agreement executed and deposit received.',
      followUpDate: null,
      followUpNotes: 'Client onboarding completed. Handover dossier delivered to vault.',
      propertyId: taiyo.id,
      timeline: [
        { fromStatus: null, toStatus: 'NEW', note: 'Direct inbound VIP client call.' },
        { fromStatus: 'NEW', toStatus: 'QUALIFIED', note: 'Funds cleared through DLD escrow.' },
        { fromStatus: 'QUALIFIED', toStatus: 'NEGOTIATING', note: 'SPA unit selection finalised.' },
        { fromStatus: 'NEGOTIATING', toStatus: 'CLOSED_WON', note: 'Deposit verified and agreement formally signed.' },
      ],
    },
    {
      name: 'Ananya Deshmukh',
      email: 'ananya@deshmukhholdings.com',
      phone: '+91 98220 55140',
      investmentType: 'real-estate',
      investmentRange: '₹30 Cr',
      currency: Currency.INR,
      status: InquiryStatus.NEW,
      source: LeadSource.WHATSAPP_CONCIERGE,
      notes: 'Requested complete brochure and video walkthrough for Carlton Krillam wellness residences.',
      followUpDate: new Date('2026-09-10T11:00:00.000Z'),
      followUpNotes: 'Follow-up call scheduled with client concierge manager.',
      propertyId: carlton.id,
      timeline: [
        { fromStatus: null, toStatus: 'NEW', note: 'Inquiry received via WhatsApp Concierge portal.' },
      ],
    },
    {
      name: 'Jean-Luc Moreau',
      email: 'jl.moreau@genevacapital.ch',
      phone: '+41 22 700 8910',
      investmentType: 'franchise',
      investmentRange: '₹35 Cr ($4.2M)',
      currency: Currency.INR,
      status: InquiryStatus.CONTACTED,
      source: LeadSource.HERO_INQUIRY,
      notes: 'Swiss wealth manager inquiring about commercial tax benefits and quarterly payout mechanics for FOCO model.',
      followUpDate: new Date('2026-09-13T15:00:00.000Z'),
      followUpNotes: 'Send Swiss tax treaty memorandum & audited resort balance sheets.',
      propertyId: wellnessFranchise.id,
      timeline: [
        { fromStatus: null, toStatus: 'NEW', note: 'Inquiry received from Geneva IP address.' },
        { fromStatus: 'NEW', toStatus: 'CONTACTED', note: 'International tax prospectus delivered via secure email.' },
      ],
    },
  ];

  for (const inqData of vipInquiries) {
    const { timeline, ...leadFields } = inqData;
    const createdInquiry = await prisma.inquiry.create({
      data: {
        ...leadFields,
      },
    });

    if (timeline && timeline.length > 0) {
      for (const t of timeline) {
        await prisma.inquiryTimeline.create({
          data: {
            inquiryId: createdInquiry.id,
            fromStatus: t.fromStatus,
            toStatus: t.toStatus,
            note: t.note,
          },
        });
      }
    }
  }

  console.log(`✨ Seeded ${vipInquiries.length} VIP leads with detailed audit timelines.`);
  console.log('🎉 Client-Ready Data Sanitization and Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Error during data seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
