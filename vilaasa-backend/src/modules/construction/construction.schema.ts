import { z } from "zod";

export const UpdateConstructionSchema = z.object({
  structureProgress: z.number().min(0).max(100),
  interiorProgress: z.number().min(0).max(100),
  overallProgress: z.number().min(0).max(100),
  lastUpdate: z
    .string()
    .datetime({ message: "lastUpdate must be an ISO date string" })
    .optional(),
});

export const MilestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required"),
  status: z.enum(["COMPLETED", "IN_PROGRESS", "UPCOMING"]).default("UPCOMING"),
  targetDate: z
    .string()
    .datetime({ message: "targetDate must be an ISO date string" }),
});

export const UpdateMilestoneSchema = MilestoneSchema.partial();

export const GalleryItemSchema = z.object({
  imageUrl: z.string().url("Valid image URL required"),
  date: z
    .string()
    .datetime({ message: "date must be an ISO date string" })
    .optional(),
  caption: z.string().optional(),
});

export type UpdateConstructionInput = z.infer<typeof UpdateConstructionSchema>;
export type MilestoneInput = z.infer<typeof MilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>;
export type GalleryItemInput = z.infer<typeof GalleryItemSchema>;
