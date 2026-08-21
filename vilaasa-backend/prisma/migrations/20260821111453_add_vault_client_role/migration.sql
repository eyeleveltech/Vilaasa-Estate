/*
  Warnings:

  - The values [ADMIN,AGENT,INVESTOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'CHANNEL_PARTNER', 'VAULT_CLIENT');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CHANNEL_PARTNER';
COMMIT;

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "followUpDate" TIMESTAMP(3),
ADD COLUMN     "followUpNotes" TEXT,
ADD COLUMN     "utmMedium" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "brochureUrl" TEXT;

-- CreateTable
CREATE TABLE "OtpRecord" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryTimeline" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "note" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelPartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "experience" TEXT,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelPartner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpRecord_email_idx" ON "OtpRecord"("email");

-- CreateIndex
CREATE INDEX "InquiryTimeline_inquiryId_idx" ON "InquiryTimeline"("inquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelPartner_email_key" ON "ChannelPartner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelPartner_userId_key" ON "ChannelPartner"("userId");

-- CreateIndex
CREATE INDEX "ChannelPartner_status_idx" ON "ChannelPartner"("status");

-- CreateIndex
CREATE INDEX "Inquiry_followUpDate_idx" ON "Inquiry"("followUpDate");

-- AddForeignKey
ALTER TABLE "InquiryTimeline" ADD CONSTRAINT "InquiryTimeline_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
