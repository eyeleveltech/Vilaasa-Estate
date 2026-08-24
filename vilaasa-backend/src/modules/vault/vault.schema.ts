import { z } from "zod";

export const CreateVaultAssetSchema = z.object({
  userId: z.string({ required_error: "User/Client ID is required" }),
  propertyId: z.string({ required_error: "Property ID is required" }),
  unitNumber: z.string().min(1, "Unit / Suite number is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchasePrice: z.number().positive("Purchase price must be positive"),
  currentValuation: z.number().positive("Current valuation must be positive"),
  monthlyRentalYield: z.number().nonnegative().optional(),
  occupancyStatus: z.enum(["OCCUPIED", "VACANT", "UNDER_MAINTENANCE", "RESERVED"]).default("OCCUPIED"),
});

export const UpdateVaultAssetSchema = z.object({
  unitNumber: z.string().optional(),
  currentValuation: z.number().positive().optional(),
  monthlyRentalYield: z.number().nonnegative().optional(),
  occupancyStatus: z.enum(["OCCUPIED", "VACANT", "UNDER_MAINTENANCE", "RESERVED"]).optional(),
});

export const QuickUpdateValuationSchema = z.object({
  currentValuation: z.number().positive("Current valuation must be positive"),
  monthlyRentalYield: z.number().nonnegative().optional(),
});

export const OnboardInvestorSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").trim(),
  email: z.string().email("A valid email address is required").trim().toLowerCase(),
  phone: z.string().optional(),
  phoneCode: z.string().optional().default("+91"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const CreateConciergeRequestSchema = z.object({
  type: z.string().min(1, "Request type is required"),
  propertyId: z.string().optional().nullable(),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

export const CreateNomineeSchema = z.object({
  name: z.string().min(2, "Nominee name is required").trim(),
  relationship: z.string().min(2, "Relationship is required").trim(),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  share: z.number().int().min(1).max(100).default(100),
  isPrimary: z.boolean().default(false),
});

export const CreateLegacyDocumentSchema = z.object({
  name: z.string().min(2, "Document name is required"),
  type: z.string().min(1, "Document type is required"),
  fileUrl: z.string().url("A valid file URL is required"),
});

export const CreateVaultDocumentSchema = z.object({
  name: z.string().min(2, "Document name is required"),
  type: z.string().min(1, "Document category is required"),
  fileUrl: z.string().url("A valid file URL is required"),
  vaultAssetId: z.string().optional().nullable(),
  sizeLabel: z.string().optional(),
  iconKey: z.string().optional(),
});

export type CreateVaultAssetInput = z.infer<typeof CreateVaultAssetSchema>;
export type UpdateVaultAssetInput = z.infer<typeof UpdateVaultAssetSchema>;
export type QuickUpdateValuationInput = z.infer<typeof QuickUpdateValuationSchema>;
export type OnboardInvestorInput = z.infer<typeof OnboardInvestorSchema>;
export type CreateConciergeRequestInput = z.infer<typeof CreateConciergeRequestSchema>;
export type CreateNomineeInput = z.infer<typeof CreateNomineeSchema>;
export type CreateLegacyDocumentInput = z.infer<typeof CreateLegacyDocumentSchema>;
export type CreateVaultDocumentInput = z.infer<typeof CreateVaultDocumentSchema>;


