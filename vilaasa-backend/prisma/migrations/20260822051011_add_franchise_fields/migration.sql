-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "advantages" JSONB,
ADD COLUMN     "expectedAnnualRoi" DOUBLE PRECISION,
ADD COLUMN     "franchiseModel" TEXT,
ADD COLUMN     "lockInPeriodYears" DOUBLE PRECISION,
ADD COLUMN     "minTicketSize" DECIMAL(15,2),
ADD COLUMN     "paybackPeriodYears" DOUBLE PRECISION,
ADD COLUMN     "supportModules" JSONB,
ADD COLUMN     "totalProjectCost" DECIMAL(15,2),
ADD COLUMN     "yieldPayoutFrequency" TEXT;
