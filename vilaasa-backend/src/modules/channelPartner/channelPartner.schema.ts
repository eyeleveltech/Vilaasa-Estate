import { z } from "zod";

export const RegisterChannelPartnerSchema = z.object({
  name: z.string().min(2, "Full name is required").trim(),
  email: z.string().email("Valid email address required").toLowerCase().trim(),
  phone: z.string().min(6, "Valid phone number required").trim(),
  company: z.string().optional(),
  experience: z.string().optional(), // e.g. "5-10 years"
  city: z.string().optional(), // e.g. "Dubai", "Mumbai"
});

export const UpdatePartnerStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], {
    required_error: "Status is required",
  }),
});

export const PartnerFilterSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const OnboardChannelPartnerSchema = z.object({
  name: z.string().min(2, "Full name is required").trim(),
  email: z.string().email("Valid email address required").toLowerCase().trim(),
  phone: z.string().optional(),
  phoneCode: z.string().default("+91"),
  company: z.string().optional(),
  experience: z.string().optional(),
  city: z.string().optional(),
  licenseNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterChannelPartnerInput = z.infer<
  typeof RegisterChannelPartnerSchema
>;
export type UpdatePartnerStatusInput = z.infer<
  typeof UpdatePartnerStatusSchema
>;
export type PartnerFilterQuery = z.infer<typeof PartnerFilterSchema>;
export type OnboardChannelPartnerInput = z.infer<
  typeof OnboardChannelPartnerSchema
>;

