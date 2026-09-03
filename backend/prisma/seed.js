"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting database seeding for Vilaasa Estates...");
    // 1. Clean existing data
    await prisma.vaultAsset.deleteMany();
    await prisma.siteVisit.deleteMany();
    await prisma.inquiry.deleteMany();
    await prisma.constructionGalleryItem.deleteMany();
    await prisma.constructionMilestone.deleteMany();
    await prisma.constructionAsset.deleteMany();
    await prisma.propertyFinancialMetric.deleteMany();
    await prisma.nearbyPlace.deleteMany();
    await prisma.propertyOnAmenity.deleteMany();
    await prisma.propertyMedia.deleteMany();
    await prisma.propertyConfiguration.deleteMany();
    await prisma.property.deleteMany();
    await prisma.location.deleteMany();
    await prisma.amenity.deleteMany();
    await prisma.user.deleteMany();
    // 2. Create Users
    const passwordHash = await bcryptjs_1.default.hash("Admin@Vilaasa2026", 12);
    const partnerHash = await bcryptjs_1.default.hash("Partner@Vilaasa2026", 12);
    const admin = await prisma.user.create({
        data: {
            email: "admin@vilaasa.com",
            passwordHash,
            name: "Vilaasa Master Admin",
            phone: "+971501234567",
            phoneCode: "+971",
            role: client_1.Role.ADMIN,
            licenseNumber: "DLD-BRN-884920",
        },
    });
    const channelPartner = await prisma.user.create({
        data: {
            email: "partner@luxuryestates.com",
            passwordHash: partnerHash,
            name: "Apex Global Capital Partners",
            phone: "+919876543210",
            phoneCode: "+91",
            role: client_1.Role.CHANNEL_PARTNER,
            licenseNumber: "MahaRERA-A51800029381",
        },
    });
    console.log(` Created Admin: ${admin.email} and Channel Partner: ${channelPartner.email}`);
    // 3. Create Standard Amenities
    const amenitiesList = [
        { name: "Private Infinity Pool", iconKey: "pool", category: "Wellness" },
        { name: "24/7 Dedicated Butler Service", iconKey: "room_service", category: "Lifestyle" },
        { name: "Private Helipad Access", iconKey: "helicopter", category: "Aviation" },
        { name: "Direct Yacht Mooring", iconKey: "sailing", category: "Waterfront" },
        { name: "Cryo & Thermal Wellness Spa", iconKey: "spa", category: "Wellness" },
        { name: "Biometric & 24/7 Armed Security", iconKey: "security", category: "Security" },
        { name: "Crestron Smart Home Automation", iconKey: "settings_remote", category: "Technology" },
        { name: "Temperature Controlled Wine Cellar", iconKey: "wine_bar", category: "Lifestyle" },
    ];
    const createdAmenities = {};
    for (const item of amenitiesList) {
        const amenity = await prisma.amenity.create({ data: item });
        createdAmenities[item.name] = amenity.id;
    }
    console.log(` Created ${amenitiesList.length} luxury amenities.`);
    // 4. Create Locations
    const dubaiLocation = await prisma.location.create({
        data: {
            city: "Dubai",
            country: "UAE",
            community: "Palm Jumeirah",
            addressLine: "Frond G, Signature Villa Enclave",
            postalCode: "00000",
            latitude: 25.1124,
            longitude: 55.139,
            googleMapUrl: "https://maps.google.com/?q=25.1124,55.1390",
        },
    });
    const mumbaiLocation = await prisma.location.create({
        data: {
            city: "Mumbai",
            country: "India",
            community: "Worli Sea Face",
            addressLine: "Khan Abdul Ghaffar Khan Road",
            postalCode: "400018",
            latitude: 19.0068,
            longitude: 72.8166,
            googleMapUrl: "https://maps.google.com/?q=19.0068,72.8166",
        },
    });
    console.log(" Created Dubai & Mumbai luxury locations.");
    // 5. Create Property 1: Palm Royale Signature Villa (Dubai)
    const palmRoyale = await prisma.property.create({
        data: {
            slug: "palm-royale-villa",
            name: "Palm Royale Signature Villa",
            tagline: "Ultra-Prime Waterfront Living on Palm Jumeirah",
            description: "Palm Royale represents the zenith of architectural majesty on Palm Jumeirahs coveted Billionaires Row. Crafted by world-renowned architects, this bespoke sanctuary features private Arabian Gulf access, double-height Italian marble galleries, and unmatched skyline vistas.",
            visionHeadline: "Where Mediterranean artistry meets Dubai's limitless ambition.",
            type: client_1.PropertyType.RESIDENTIAL_VILLA,
            status: client_1.PropertyStatus.READY_TO_MOVE,
            price: 185000000.0, // AED 185M / Equivalent
            currency: client_1.Currency.AED,
            priceOnApplication: false,
            rentalYieldPercent: 6.8,
            expectedIrrPercent: 21.5,
            appreciationPercent: 28.0,
            totalAreaSqFt: 14500,
            bedrooms: 6,
            bathrooms: 8,
            furnishingStatus: client_1.FurnishingStatus.DESIGNER_FURNISHED,
            possessionDate: new Date("2026-03-31"),
            reraNumber: "DLD-TRAKHEESI-662819",
            ownershipType: "Freehold",
            paymentPlan: {
                bookingAmount: "10%",
                duringConstruction: "40%",
                onHandover: "50%",
            },
            virtualTour360Url: "https://my.matterport.com/show/?m=sample360tour",
            maintenanceFeePerSqFt: 18.5,
            verdictQuote: "An irreproducible trophy asset commanding one of the widest private beach frontages remaining on the Palm.",
            verdictAuthor: "Tariq Al-Mansoor",
            verdictTitle: "Director of Private Client Acquisitions",
            locationId: dubaiLocation.id,
            adminId: admin.id,
            configurations: {
                create: [
                    {
                        unitType: "Grand Presidential Villa",
                        areaSqFt: 14500,
                        viewType: "Private Beach & Dubai Marina Skyline",
                        price: 185000000.0,
                        isAvailable: true,
                    },
                ],
            },
            media: {
                create: [
                    {
                        mediaType: "HERO_IMAGE",
                        url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
                        altText: "Palm Royale Sunset View",
                        orderIndex: 0,
                        isFeatured: true,
                    },
                    {
                        mediaType: "GALLERY",
                        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
                        altText: "Grand Living Foyer",
                        orderIndex: 1,
                        isFeatured: false,
                    },
                ],
            },
            amenities: {
                create: [
                    { amenityId: createdAmenities["Private Infinity Pool"] },
                    { amenityId: createdAmenities["24/7 Dedicated Butler Service"] },
                    { amenityId: createdAmenities["Direct Yacht Mooring"] },
                    { amenityId: createdAmenities["Crestron Smart Home Automation"] },
                ],
            },
            nearbyPlaces: {
                create: [
                    { name: "Atlantis The Royal", distance: "4 Mins Drive", category: "Dining" },
                    { name: "Dubai International Airport (DXB)", distance: "25 Mins Drive", category: "Airport" },
                    { name: "Dubai Marina Yacht Club", distance: "12 Mins Drive", category: "Leisure" },
                ],
            },
            financialMetrics: {
                create: [
                    { label: "Net Rental Yield", value: "6.8% p.a.", note: "Tax-Free Yield in AED", icon: "savings" },
                    { label: "5-Year Capital Growth", value: "28.0%", note: "Based on prime waterfront scarcity", icon: "trending_up" },
                ],
            },
        },
    });
    console.log(` Seeded Property: ${palmRoyale.name}`);
    // 6. Create Property 2: The Aurum Sky Penthouse (Mumbai)
    const aurum = await prisma.property.create({
        data: {
            slug: "the-aurum-penthouse",
            name: "The Aurum Sky Residence",
            tagline: "Iconic Arabian Sea Facing Duplex Penthouse",
            description: "Perched atop Worlis landmark tower, The Aurum Sky Residence delivers 12,000 sq.ft. of uninterrupted panoramic Arabian Sea and Bandra-Worli Sea Link views. Designed for ultra-high-net-worth families desiring peerless discretion and timeless prestige.",
            visionHeadline: "A private kingdom in the clouds above Mumbai's most prestigious coastline.",
            type: client_1.PropertyType.PENTHOUSE,
            status: client_1.PropertyStatus.UNDER_CONSTRUCTION,
            price: 1200000000.0, // ₹120 Cr
            currency: client_1.Currency.INR,
            priceOnApplication: false,
            rentalYieldPercent: 3.5,
            expectedIrrPercent: 18.0,
            appreciationPercent: 35.0,
            totalAreaSqFt: 12000,
            bedrooms: 5,
            bathrooms: 7,
            furnishingStatus: client_1.FurnishingStatus.FULLY_FURNISHED,
            possessionDate: new Date("2026-12-31"),
            reraNumber: "MahaRERA-P51900004521",
            ownershipType: "Freehold",
            virtualTour360Url: "https://my.matterport.com/show/?m=sample360mumbai",
            maintenanceFeePerSqFt: 45.0,
            verdictQuote: "The defining architectural trophy of South Mumbai's coastline with private elevator lifts directly into all levels.",
            verdictAuthor: "Aditya Singhania",
            verdictTitle: "Senior Partner, Vilaasa India",
            locationId: mumbaiLocation.id,
            adminId: admin.id,
            configurations: {
                create: [
                    {
                        unitType: "Triplex Sky Villa",
                        areaSqFt: 12000,
                        viewType: "360 Sea Link & Ocean View",
                        price: 1200000000.0,
                        isAvailable: true,
                    },
                ],
            },
            media: {
                create: [
                    {
                        mediaType: "HERO_IMAGE",
                        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80",
                        altText: "Sea Link Sky Penthouse View",
                        orderIndex: 0,
                        isFeatured: true,
                    },
                ],
            },
            amenities: {
                create: [
                    { amenityId: createdAmenities["Private Helipad Access"] },
                    { amenityId: createdAmenities["Cryo & Thermal Wellness Spa"] },
                    { amenityId: createdAmenities["Biometric & 24/7 Armed Security"] },
                    { amenityId: createdAmenities["Temperature Controlled Wine Cellar"] },
                ],
            },
            constructionAsset: {
                create: {
                    structureProgress: 85,
                    interiorProgress: 40,
                    overallProgress: 68,
                    lastUpdate: new Date(),
                    milestones: {
                        create: [
                            { name: "Superstructure Topping Out", status: "COMPLETED", targetDate: new Date("2025-11-15") },
                            { name: "Façade & Curtain Wall Installation", status: "IN_PROGRESS", targetDate: new Date("2026-06-30") },
                            { name: "Interior Finishing & Fitouts", status: "UPCOMING", targetDate: new Date("2026-11-30") },
                        ],
                    },
                },
            },
        },
    });
    console.log(` Seeded Property: ${aurum.name}`);
    console.log(" Seeding completed successfully!");
}
main()
    .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map