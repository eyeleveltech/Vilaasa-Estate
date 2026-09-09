import { z } from "zod";

export const FranchisePageSchema = z.object({
  pageTitle: z.string().max(255).optional().nullable(),
  mainHeadline: z.string().max(255).optional().nullable(),
  subheading: z.string().optional().nullable(),
  heroImage: z.string().max(1000).optional().nullable(),

  heroMetrics: z.array(z.any()).optional().nullable(),
  blueprintMetrics: z.array(z.any()).optional().nullable(),
  ecosystemCards: z.array(z.any()).optional().nullable(),
  benefitCards: z.array(z.any()).optional().nullable(),
  sectionVisibility: z.record(z.boolean()).optional().nullable(),

  metric1Label: z.string().max(100).optional().nullable(),
  metric1Value: z.string().max(100).optional().nullable(),
  metric2Label: z.string().max(100).optional().nullable(),
  metric2Value: z.string().max(100).optional().nullable(),
  metric3Label: z.string().max(100).optional().nullable(),
  metric3Value: z.string().max(100).optional().nullable(),
  metric4Label: z.string().max(100).optional().nullable(),
  metric4Value: z.string().max(100).optional().nullable(),

  visionHeadline: z.string().max(255).optional().nullable(),
  visionDescription: z.string().optional().nullable(),

  stat1Label: z.string().max(100).optional().nullable(),
  stat1Value: z.string().max(100).optional().nullable(),
  stat2Label: z.string().max(100).optional().nullable(),
  stat2Value: z.string().max(100).optional().nullable(),
  stat3Label: z.string().max(100).optional().nullable(),
  stat3Value: z.string().max(100).optional().nullable(),

  metric5Label: z.string().max(100).optional().nullable(),
  metric5Value: z.string().max(100).optional().nullable(),
  metric6Label: z.string().max(100).optional().nullable(),
  metric6Value: z.string().max(100).optional().nullable(),
  metric7Label: z.string().max(100).optional().nullable(),
  metric7Value: z.string().max(100).optional().nullable(),
  metric8Label: z.string().max(100).optional().nullable(),
  metric8Value: z.string().max(100).optional().nullable(),

  planningHeadline: z.string().max(255).optional().nullable(),
  planningDescription: z.string().optional().nullable(),
  ctaButton1: z.string().max(100).optional().nullable(),

  ecosystemSubheading: z.string().max(255).optional().nullable(),
  ecosystemHeading: z.string().max(255).optional().nullable(),
  ecosystemDescription: z.string().optional().nullable(),

  support1Title: z.string().max(255).optional().nullable(),
  support1Description: z.string().optional().nullable(),
  support1Icon: z.string().max(100).optional().nullable(),
  support2Title: z.string().max(255).optional().nullable(),
  support2Description: z.string().optional().nullable(),
  support2Icon: z.string().max(100).optional().nullable(),
  support3Title: z.string().max(255).optional().nullable(),
  support3Description: z.string().optional().nullable(),
  support3Icon: z.string().max(100).optional().nullable(),
  support4Title: z.string().max(255).optional().nullable(),
  support4Description: z.string().optional().nullable(),
  support4Icon: z.string().max(100).optional().nullable(),

  benefitsSubheading: z.string().max(255).optional().nullable(),
  benefitsDescription: z.string().optional().nullable(),

  benefit1Title: z.string().max(255).optional().nullable(),
  benefit1Description: z.string().optional().nullable(),
  benefit1Icon: z.string().max(100).optional().nullable(),
  benefit2Title: z.string().max(255).optional().nullable(),
  benefit2Description: z.string().optional().nullable(),
  benefit2Icon: z.string().max(100).optional().nullable(),
  benefit3Title: z.string().max(255).optional().nullable(),
  benefit3Description: z.string().optional().nullable(),
  benefit3Icon: z.string().max(100).optional().nullable(),

  nextStepsSubheading: z.string().max(255).optional().nullable(),
  nextStepsDescription: z.string().optional().nullable(),
  ctaButton2: z.string().max(100).optional().nullable(),

  galleryImages: z.array(z.any()).optional().nullable(),
});

export type FranchisePageInput = z.infer<typeof FranchisePageSchema>;
