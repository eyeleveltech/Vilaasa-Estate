import { Router } from "express";
import { Role } from "@prisma/client";
import {
  getPublicHeroHighlights,
  getAdminHeroHighlights,
  createHeroHighlight,
  updateHeroHighlight,
  deleteHeroHighlight,
} from "./heroHighlight.controller";
import {
  CreateHeroHighlightSchema,
  UpdateHeroHighlightSchema,
} from "./heroHighlight.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Public route for homepage
router.get("/", getPublicHeroHighlights);

// Protected Super Admin routes
router.get(
  "/admin",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  getAdminHeroHighlights,
);

router.post(
  "/",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(CreateHeroHighlightSchema),
  createHeroHighlight,
);

router.put(
  "/:id",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdateHeroHighlightSchema),
  updateHeroHighlight,
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  deleteHeroHighlight,
);

export default router;
