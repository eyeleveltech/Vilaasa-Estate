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

export type CreateVaultAssetInput = z.infer<typeof CreateVaultAssetSchema>;
export type UpdateVaultAssetInput = z.infer<typeof UpdateVaultAssetSchema>;
export type QuickUpdateValuationInput = z.infer<typeof QuickUpdateValuationSchema>;
export type OnboardInvestorInput = z.infer<typeof OnboardInvestorSchema>;

