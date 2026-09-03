import { Router } from "express";
import { Role } from "@prisma/client";
import {
  getAllAmenities,
  createAmenity,
  assignAmenityToProperty,
  removeAmenityFromProperty,
} from "./amenity.controller";
import {
  CreateAmenitySchema,
  AssignAmenitySchema,
} from "./amenity.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Public catalog
router.get("/", getAllAmenities);

// Super Admin create amenity in catalog
router.post(
  "/",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(CreateAmenitySchema),
  createAmenity,
);

// Property amenity assignments
router.post(
  "/assign/:propertyId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(AssignAmenitySchema),
  assignAmenityToProperty,
);

router.delete(
  "/assign/:propertyId/:amenityId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  removeAmenityFromProperty,
);

export default router;
