import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  getInquiryStats,
  updateInquiryStatus,
  scheduleFollowUp,
  getInquiryTimeline,
} from "./inquiry.controller";
import {
  CreateInquirySchema,
  UpdateInquiryStatusSchema,
  ScheduleFollowUpSchema,
  InquiryFilterSchema,
} from "./inquiry.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Public submission
router.post("/", validate(CreateInquirySchema), createInquiry);

// Protected inquiries stats (Super Admin & Channel Partners)
router.get(
  "/stats",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN, Role.CHANNEL_PARTNER),
  getInquiryStats,
);

// Protected inquiries list (Super Admin & Channel Partners)
router.get(
  "/",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN, Role.CHANNEL_PARTNER),
  validate(InquiryFilterSchema, "query"),
  getInquiries,
);

// Get single inquiry with timeline
router.get(
  "/:id",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN, Role.CHANNEL_PARTNER),
  getInquiryById,
);

// Super Admin status updates (adds timeline record)
router.patch(
  "/:id/status",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdateInquiryStatusSchema),
  updateInquiryStatus,
);

// Schedule next touchpoint follow-up
router.patch(
  "/:id/follow-up",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(ScheduleFollowUpSchema),
  scheduleFollowUp,
);

// Retrieve full timeline history
router.get(
  "/:id/timeline",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN, Role.CHANNEL_PARTNER),
  getInquiryTimeline,
);

export default router;
