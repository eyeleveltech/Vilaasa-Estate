import { z } from "zod";

export const CreateSiteVisitSchema = z.object({
  propertyId: z.string({ required_error: "Property ID is required" }),
  name: z.string().min(2, "Full name is required").trim(),
  email: z.string().email("Valid email address required").toLowerCase().trim(),
  phone: z.string().min(6, "Valid phone number required").trim(),
  scheduledDate: z.string().min(1, "Inspection date is required"),
  scheduledTime: z.string().min(1, "Inspection time is required"), // e.g. "11:00 AM"
  timezone: z.string().default("Asia/Kolkata"),
  visitType: z.string().default("real-estate-india"),
  notes: z.string().optional(),
});

export const UpdateSiteVisitStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED", "RESCHEDULED"], {
    required_error: "Status is required",
  }),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  notes: z.string().optional(),
});

export const SiteVisitFilterSchema = z.object({
  propertyId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateSiteVisitInput = z.infer<typeof CreateSiteVisitSchema>;
export type UpdateSiteVisitStatusInput = z.infer<
  typeof UpdateSiteVisitStatusSchema
>;
export type SiteVisitFilterQuery = z.infer<typeof SiteVisitFilterSchema>;
