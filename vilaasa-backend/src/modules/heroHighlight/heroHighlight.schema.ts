import { z } from "zod";

export const CreateHeroHighlightSchema = z.object({
  name: z.string().min(2, "Highlight name must be at least 2 characters").trim(),
  tagline: z.string().min(2, "Tagline / subtitle is required").trim(),
  linkUrl: z.string().min(1, "Target destination URL or slug is required").trim(),
  icon: z.string().default("hotel_class"),
  order: z.number().int().min(1).max(10).default(1),
  isActive: z.boolean().default(true),
});

export const UpdateHeroHighlightSchema = CreateHeroHighlightSchema.partial();

export type CreateHeroHighlightInput = z.infer<typeof CreateHeroHighlightSchema>;
export type UpdateHeroHighlightInput = z.infer<typeof UpdateHeroHighlightSchema>;
