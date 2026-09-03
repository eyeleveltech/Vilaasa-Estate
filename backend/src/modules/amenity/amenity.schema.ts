import { z } from "zod";

export const CreateAmenitySchema = z.object({
  name: z.string().min(2, "Amenity name is required").trim(),
  iconKey: z.string().min(1, "Icon key is required").trim(),
  category: z.string().optional().default("Lifestyle"),
});

export const AssignAmenitySchema = z.object({
  amenityId: z.string().min(1, "Amenity ID is required"),
  description: z.string().optional(),
});

export type CreateAmenityInput = z.infer<typeof CreateAmenitySchema>;
export type AssignAmenityInput = z.infer<typeof AssignAmenitySchema>;
