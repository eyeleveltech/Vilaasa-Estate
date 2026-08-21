import { z } from "zod";
import { Currency, InquiryStatus, LeadSource } from "@prisma/client";

export const CreateInquirySchema = z.object({
  name: z.string().min(2, "Name is required").trim(),
  email: z.string().email("Valid email address required").toLowerCase().trim(),
  phone: z.string().min(6, "Valid phone number required").trim(),
  investmentType: z.string().default("real-estate"),
  investmentRange: z.string().min(1, "Investment range is required"),
  currency: z.nativeEnum(Currency).default(Currency.INR),
  propertyId: z.string().optional(),
  source: z.nativeEnum(LeadSource).default(LeadSource.HERO_INQUIRY),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateInquiryStatusSchema = z.object({
  status: z.nativeEnum(InquiryStatus),
  assignedAgentId: z.string().optional(),
  notes: z.string().optional(),
});

export const ScheduleFollowUpSchema = z.object({
  followUpDate: z.string().min(1, "Follow-up date is required"),
  followUpNotes: z.string().optional(),
});

export const AddTimelineNoteSchema = z.object({
  note: z.string().min(1, "Timeline note is required"),
  toStatus: z.nativeEnum(InquiryStatus).optional(),
});

export const InquiryFilterSchema = z.object({
  status: z.nativeEnum(InquiryStatus).optional(),
  propertyId: z.string().optional(),
  source: z.nativeEnum(LeadSource).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;
export type UpdateInquiryStatusInput = z.infer<typeof UpdateInquiryStatusSchema>;
export type ScheduleFollowUpInput = z.infer<typeof ScheduleFollowUpSchema>;
export type AddTimelineNoteInput = z.infer<typeof AddTimelineNoteSchema>;
export type InquiryFilterQuery = z.infer<typeof InquiryFilterSchema>;
