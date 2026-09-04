-- AlterTable
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "sectionVisibility" JSONB;

-- AlterTable
ALTER TABLE "FranchisePage" ADD COLUMN IF NOT EXISTS "sectionVisibility" JSONB;
