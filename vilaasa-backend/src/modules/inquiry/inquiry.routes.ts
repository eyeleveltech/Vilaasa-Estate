import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
} from "./inquiry.controller";
import {
  CreateInquirySchema,
  UpdateInquiryStatusSchema,
  InquiryFilterSchema,
} from "./inquiry.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Public submission
router.post("/", validate(CreateInquirySchema), createInquiry);

// Protected inquiries list (Super Admin & Channel Partners)
router.get(
  "/",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN, Role.CHANNEL_PARTNER),
  validate(InquiryFilterSchema, "query"),
  getInquiries,
);

// Super Admin status updates
router.patch(
  "/:id/status",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdateInquiryStatusSchema),
  updateInquiryStatus,
);

export default router;
