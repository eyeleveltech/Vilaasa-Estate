import { Router } from "express";
import { Role } from "@prisma/client";
import {
  getConstructionAsset,
  upsertConstructionAsset,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  addGalleryItem,
  deleteGalleryItem,
} from "./construction.controller";
import {
  UpdateConstructionSchema,
  MilestoneSchema,
  UpdateMilestoneSchema,
  GalleryItemSchema,
} from "./construction.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Public route to view construction status
router.get("/:propertyId", getConstructionAsset);

// Super Admin management routes
router.put(
  "/:propertyId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdateConstructionSchema),
  upsertConstructionAsset,
);

router.post(
  "/:propertyId/milestones",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(MilestoneSchema),
  addMilestone,
);

router.put(
  "/:propertyId/milestones/:milestoneId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdateMilestoneSchema),
  updateMilestone,
);

router.delete(
  "/:propertyId/milestones/:milestoneId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  deleteMilestone,
);

router.post(
  "/:propertyId/gallery",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(GalleryItemSchema),
  addGalleryItem,
);

router.delete(
  "/:propertyId/gallery/:itemId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  deleteGalleryItem,
);

export default router;
