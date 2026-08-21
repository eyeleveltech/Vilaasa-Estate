import { Router } from "express";
import { Role } from "@prisma/client";
import {
  registerChannelPartner,
  getChannelPartners,
  getChannelPartnerById,
  updatePartnerStatus,
} from "./channelPartner.controller";
import {
  RegisterChannelPartnerSchema,
  UpdatePartnerStatusSchema,
  PartnerFilterSchema,
} from "./channelPartner.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Public partner registration
router.post(
  "/register",
  validate(RegisterChannelPartnerSchema),
  registerChannelPartner,
);

// Super Admin partner directory & review
router.get(
  "/",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(PartnerFilterSchema, "query"),
  getChannelPartners,
);

router.get(
  "/:id",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  getChannelPartnerById,
);

router.patch(
  "/:id/status",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdatePartnerStatusSchema),
  updatePartnerStatus,
);

router.patch(
  "/:id/approve",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdatePartnerStatusSchema),
  updatePartnerStatus,
);

export default router;
