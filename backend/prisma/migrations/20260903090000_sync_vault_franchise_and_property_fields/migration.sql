-- Brings the migration history back in line with schema.prisma.
--
-- The Vault module (Lease, PaymentMilestone, VaultDocument, ConciergeRequest,
-- Nominee, LegacyDocument), HeroHighlight and FranchisePage were added to the
-- schema without a matching migration - most likely via `prisma db push` - so
-- `prisma migrate deploy` produced a database the application could not query
-- ("The column Property.customType does not exist in the current database").
--
-- Generated with:
--   prisma migrate diff --from-migrations ./prisma/migrations
--     --to-schema-datamodel ./prisma/schema.prisma --script
--
-- Purely additive: no DROP TABLE, DROP COLUMN or TRUNCATE. The single
-- ALTER COLUMN relaxes OtpRecord.email to nullable, which cannot lose data.

-- CreateEnum
CREATE TYPE "RentStatus" AS ENUM ('PAID', 'OVERDUE', 'PENDING');

-- CreateEnum
CREATE TYPE "PaymentMilestoneStatus" AS ENUM ('UPCOMING', 'PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ConciergeRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "NearbyPlace" ADD COLUMN     "description" TEXT,
ADD COLUMN     "travelTime" TEXT;

-- AlterTable
ALTER TABLE "OtpRecord" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "customSpecs" JSONB,
ADD COLUMN     "customType" TEXT;

-- CreateTable
CREATE TABLE "Lease" (
    "id" TEXT NOT NULL,
    "vaultAssetId" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "leaseStart" TIMESTAMP(3) NOT NULL,
    "leaseExpiry" TIMESTAMP(3) NOT NULL,
    "monthlyRent" DECIMAL(15,2) NOT NULL,
    "rentStatus" "RentStatus" NOT NULL DEFAULT 'PAID',
    "lastPayment" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMilestone" (
    "id" TEXT NOT NULL,
    "vaultAssetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "PaymentMilestoneStatus" NOT NULL DEFAULT 'UPCOMING',
    "paidAmount" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vaultAssetId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "sizeLabel" TEXT,
    "iconKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConciergeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ConciergeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConciergeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nominee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "share" INTEGER NOT NULL DEFAULT 100,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nominee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegacyDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegacyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroHighlight" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'hotel_class',
    "order" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FranchisePage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "pageTitle" TEXT,
    "mainHeadline" TEXT,
    "subheading" TEXT,
    "heroImage" TEXT,
    "heroMetrics" JSONB,
    "blueprintMetrics" JSONB,
    "ecosystemCards" JSONB,
    "benefitCards" JSONB,
    "metric1Label" TEXT,
    "metric1Value" TEXT,
    "metric2Label" TEXT,
    "metric2Value" TEXT,
    "metric3Label" TEXT,
    "metric3Value" TEXT,
    "metric4Label" TEXT,
    "metric4Value" TEXT,
    "visionHeadline" TEXT,
    "visionDescription" TEXT,
    "stat1Label" TEXT,
    "stat1Value" TEXT,
    "stat2Label" TEXT,
    "stat2Value" TEXT,
    "stat3Label" TEXT,
    "stat3Value" TEXT,
    "metric5Label" TEXT,
    "metric5Value" TEXT,
    "metric6Label" TEXT,
    "metric6Value" TEXT,
    "metric7Label" TEXT,
    "metric7Value" TEXT,
    "metric8Label" TEXT,
    "metric8Value" TEXT,
    "planningHeadline" TEXT,
    "planningDescription" TEXT,
    "ctaButton1" TEXT,
    "ecosystemSubheading" TEXT DEFAULT 'Comprehensive Ecosystem',
    "ecosystemHeading" TEXT DEFAULT 'Support & Training',
    "ecosystemDescription" TEXT,
    "support1Title" TEXT,
    "support1Description" TEXT,
    "support1Icon" TEXT DEFAULT 'storefront',
    "support2Title" TEXT,
    "support2Description" TEXT,
    "support2Icon" TEXT DEFAULT 'design_services',
    "support3Title" TEXT,
    "support3Description" TEXT,
    "support3Icon" TEXT DEFAULT 'school',
    "support4Title" TEXT,
    "support4Description" TEXT,
    "support4Icon" TEXT DEFAULT 'campaign',
    "benefitsSubheading" TEXT DEFAULT 'The FOCO Advantage',
    "benefitsDescription" TEXT,
    "benefit1Title" TEXT,
    "benefit1Description" TEXT,
    "benefit1Icon" TEXT DEFAULT 'volunteer_activism',
    "benefit2Title" TEXT,
    "benefit2Description" TEXT,
    "benefit2Icon" TEXT DEFAULT 'shield',
    "benefit3Title" TEXT,
    "benefit3Description" TEXT,
    "benefit3Icon" TEXT DEFAULT 'trending_up',
    "nextStepsSubheading" TEXT,
    "nextStepsDescription" TEXT,
    "ctaButton2" TEXT,
    "galleryImages" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FranchisePage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lease_vaultAssetId_idx" ON "Lease"("vaultAssetId");

-- CreateIndex
CREATE INDEX "PaymentMilestone_vaultAssetId_idx" ON "PaymentMilestone"("vaultAssetId");

-- CreateIndex
CREATE INDEX "VaultDocument_userId_idx" ON "VaultDocument"("userId");

-- CreateIndex
CREATE INDEX "VaultDocument_vaultAssetId_idx" ON "VaultDocument"("vaultAssetId");

-- CreateIndex
CREATE INDEX "ConciergeRequest_userId_idx" ON "ConciergeRequest"("userId");

-- CreateIndex
CREATE INDEX "ConciergeRequest_propertyId_idx" ON "ConciergeRequest"("propertyId");

-- CreateIndex
CREATE INDEX "Nominee_userId_idx" ON "Nominee"("userId");

-- CreateIndex
CREATE INDEX "LegacyDocument_userId_idx" ON "LegacyDocument"("userId");

-- CreateIndex
CREATE INDEX "HeroHighlight_isActive_order_idx" ON "HeroHighlight"("isActive", "order");

-- CreateIndex
CREATE UNIQUE INDEX "FranchisePage_propertyId_key" ON "FranchisePage"("propertyId");

-- CreateIndex
CREATE INDEX "FranchisePage_propertyId_idx" ON "FranchisePage"("propertyId");

-- CreateIndex
CREATE INDEX "OtpRecord_phone_idx" ON "OtpRecord"("phone");

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_vaultAssetId_fkey" FOREIGN KEY ("vaultAssetId") REFERENCES "VaultAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMilestone" ADD CONSTRAINT "PaymentMilestone_vaultAssetId_fkey" FOREIGN KEY ("vaultAssetId") REFERENCES "VaultAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultDocument" ADD CONSTRAINT "VaultDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultDocument" ADD CONSTRAINT "VaultDocument_vaultAssetId_fkey" FOREIGN KEY ("vaultAssetId") REFERENCES "VaultAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConciergeRequest" ADD CONSTRAINT "ConciergeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConciergeRequest" ADD CONSTRAINT "ConciergeRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nominee" ADD CONSTRAINT "Nominee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyDocument" ADD CONSTRAINT "LegacyDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FranchisePage" ADD CONSTRAINT "FranchisePage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

