import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createSiteVisit,
  getSiteVisits,
  getSiteVisitById,
  updateSiteVisitStatus,
  getAvailableSlots,
} from "./siteVisit.controller";
import {
  CreateSiteVisitSchema,
  UpdateSiteVisitStatusSchema,
  SiteVisitFilterSchema,
} from "./siteVisit.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Public site visit booking
router.post("/", validate(CreateSiteVisitSchema), createSiteVisit);

// Public check available slots for date/property
router.get("/slots", getAvailableSlots);

// Protected site visits management (Super Admin & Channel Partner)
router.get(
  "/",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN, Role.CHANNEL_PARTNER),
  validate(SiteVisitFilterSchema, "query"),
  getSiteVisits,
);

router.get(
  "/:id",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN, Role.CHANNEL_PARTNER),
  getSiteVisitById,
);

router.patch(
  "/:id/status",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN, Role.CHANNEL_PARTNER),
  validate(UpdateSiteVisitStatusSchema),
  updateSiteVisitStatus,
);

export default router;
