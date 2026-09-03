import { Router } from "express";
import { Role } from "@prisma/client";
import {
  uploadMedia,
  uploadStandaloneMedia,
  reorderMedia,
  deleteMedia,
  updateMedia,
  getPropertyMedia,
  upload,
  ReorderMediaSchema,
} from "./media.controller";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";
import { validate } from "../../middlewares/validate";

const router = Router();

// Public media retrieval
router.get("/:propertyId", getPropertyMedia);

// Super Admin standalone file upload (Brochures, PDFs, images)
router.post(
  "/upload",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  upload.single("file"),
  uploadStandaloneMedia,
);

// Super Admin property-linked media upload
router.post(
  "/upload/:propertyId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  upload.single("file"),
  uploadMedia,
);

// Super Admin media reordering
router.patch(
  "/reorder/:propertyId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(ReorderMediaSchema),
  reorderMedia,
);

// Super Admin media metadata update (caption/altText, mediaType, isFeatured)
router.patch(
  "/:mediaId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  updateMedia,
);

// Super Admin media deletion
router.delete(
  "/:mediaId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  deleteMedia,
);

export default router;
