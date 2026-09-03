import { Router } from "express";
import { getFranchisePage, upsertFranchisePage } from "./franchise.controller";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";
import { Role } from "@prisma/client";

const router = Router();

// Public: Get franchise page content by property ID or slug
router.get("/:propertyId/page", getFranchisePage);

// Protected: Super Admin only
router.put(
  "/:propertyId/page",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  upsertFranchisePage,
);

export default router;
