-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE 'AGENT';
ALTER TYPE "Role" ADD VALUE 'INVESTOR';
ALTER TYPE "Role" ADD VALUE 'VAULT_CLIENT';

-- DropIndex
DROP INDEX "Property_status_type_idx";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Property_isDeleted_status_type_idx" ON "Property"("isDeleted", "status", "type");
