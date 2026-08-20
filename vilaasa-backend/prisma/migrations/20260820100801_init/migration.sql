-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CHANNEL_PARTNER');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL_VILLA', 'RESIDENTIAL_APARTMENT', 'PENTHOUSE', 'HERITAGE_ESTATE', 'COMMERCIAL', 'FRANCHISE', 'FARMLAND');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'UNDER_CONSTRUCTION', 'OFF_PLAN', 'READY_TO_MOVE', 'SOLD', 'RESERVED');

-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED', 'DESIGNER_FURNISHED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'AED', 'USD', 'EUR', 'GBP', 'SGD');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'SITE_VISIT_SCHEDULED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('HERO_INQUIRY', 'PROPERTY_DETAIL', 'FRANCHISE_DETAIL', 'SITE_VISIT_MODAL', 'CALENDAR_PAGE', 'CONTACT_FORM', 'CHANNEL_PARTNER_FORM', 'VAULT_CONCIERGE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "phoneCode" TEXT DEFAULT '+91',
    "role" "Role" NOT NULL DEFAULT 'CHANNEL_PARTNER',
    "avatar" TEXT,
    "licenseNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "visionHeadline" TEXT,
    "type" "PropertyType" NOT NULL DEFAULT 'RESIDENTIAL_VILLA',
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "price" DECIMAL(15,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "priceOnApplication" BOOLEAN NOT NULL DEFAULT false,
    "rentalYieldPercent" DECIMAL(5,2),
    "expectedIrrPercent" DECIMAL(5,2),
    "appreciationPercent" DECIMAL(5,2),
    "totalAreaSqFt" DOUBLE PRECISION,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "furnishingStatus" "FurnishingStatus" NOT NULL DEFAULT 'FULLY_FURNISHED',
    "possessionDate" TIMESTAMP(3),
    "reraNumber" TEXT,
    "ownershipType" TEXT,
    "paymentPlan" JSONB,
    "virtualTour360Url" TEXT,
    "maintenanceFeePerSqFt" DECIMAL(10,2),
    "verdictQuote" TEXT,
    "verdictAuthor" TEXT,
    "verdictTitle" TEXT,
    "locationId" TEXT NOT NULL,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "community" TEXT,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "googleMapUrl" TEXT,
    "mapEmbedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyConfiguration" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "areaSqFt" DOUBLE PRECISION NOT NULL,
    "viewType" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "floorPlanUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyMedia" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "altText" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyOnAmenity" (
    "propertyId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "PropertyOnAmenity_pkey" PRIMARY KEY ("propertyId","amenityId")
);

-- CreateTable
CREATE TABLE "NearbyPlace" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "NearbyPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyFinancialMetric" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "note" TEXT,
    "icon" TEXT,

    CONSTRAINT "PropertyFinancialMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionAsset" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "structureProgress" INTEGER NOT NULL DEFAULT 0,
    "interiorProgress" INTEGER NOT NULL DEFAULT 0,
    "overallProgress" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionMilestone" (
    "id" TEXT NOT NULL,
    "constructionAssetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionGalleryItem" (
    "id" TEXT NOT NULL,
    "constructionAssetId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "caption" TEXT,

    CONSTRAINT "ConstructionGalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "investmentType" TEXT NOT NULL,
    "investmentRange" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL DEFAULT 'HERO_INQUIRY',
    "notes" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "propertyId" TEXT,
    "assignedAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteVisit" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "visitType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchasePrice" DECIMAL(15,2) NOT NULL,
    "currentValuation" DECIMAL(15,2) NOT NULL,
    "monthlyRentalYield" DECIMAL(15,2),
    "occupancyStatus" TEXT NOT NULL DEFAULT 'OCCUPIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_status_type_idx" ON "Property"("status", "type");

-- CreateIndex
CREATE INDEX "Property_locationId_idx" ON "Property"("locationId");

-- CreateIndex
CREATE INDEX "Property_price_idx" ON "Property"("price");

-- CreateIndex
CREATE INDEX "Location_country_city_idx" ON "Location"("country", "city");

-- CreateIndex
CREATE INDEX "PropertyConfiguration_propertyId_idx" ON "PropertyConfiguration"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyMedia_propertyId_mediaType_idx" ON "PropertyMedia"("propertyId", "mediaType");

-- CreateIndex
CREATE INDEX "PropertyMedia_propertyId_isFeatured_idx" ON "PropertyMedia"("propertyId", "isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");

-- CreateIndex
CREATE INDEX "PropertyOnAmenity_amenityId_idx" ON "PropertyOnAmenity"("amenityId");

-- CreateIndex
CREATE INDEX "NearbyPlace_propertyId_idx" ON "NearbyPlace"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyFinancialMetric_propertyId_idx" ON "PropertyFinancialMetric"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "ConstructionAsset_propertyId_key" ON "ConstructionAsset"("propertyId");

-- CreateIndex
CREATE INDEX "ConstructionMilestone_constructionAssetId_idx" ON "ConstructionMilestone"("constructionAssetId");

-- CreateIndex
CREATE INDEX "ConstructionGalleryItem_constructionAssetId_idx" ON "ConstructionGalleryItem"("constructionAssetId");

-- CreateIndex
CREATE INDEX "Inquiry_status_propertyId_idx" ON "Inquiry"("status", "propertyId");

-- CreateIndex
CREATE INDEX "Inquiry_email_idx" ON "Inquiry"("email");

-- CreateIndex
CREATE INDEX "SiteVisit_propertyId_scheduledDate_idx" ON "SiteVisit"("propertyId", "scheduledDate");

-- CreateIndex
CREATE INDEX "VaultAsset_userId_idx" ON "VaultAsset"("userId");

-- CreateIndex
CREATE INDEX "VaultAsset_propertyId_idx" ON "VaultAsset"("propertyId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyConfiguration" ADD CONSTRAINT "PropertyConfiguration_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyMedia" ADD CONSTRAINT "PropertyMedia_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyOnAmenity" ADD CONSTRAINT "PropertyOnAmenity_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyOnAmenity" ADD CONSTRAINT "PropertyOnAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearbyPlace" ADD CONSTRAINT "NearbyPlace_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyFinancialMetric" ADD CONSTRAINT "PropertyFinancialMetric_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionAsset" ADD CONSTRAINT "ConstructionAsset_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionMilestone" ADD CONSTRAINT "ConstructionMilestone_constructionAssetId_fkey" FOREIGN KEY ("constructionAssetId") REFERENCES "ConstructionAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionGalleryItem" ADD CONSTRAINT "ConstructionGalleryItem_constructionAssetId_fkey" FOREIGN KEY ("constructionAssetId") REFERENCES "ConstructionAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteVisit" ADD CONSTRAINT "SiteVisit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultAsset" ADD CONSTRAINT "VaultAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultAsset" ADD CONSTRAINT "VaultAsset_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
