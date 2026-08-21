import { Router } from "express";
import { Role } from "@prisma/client";
import {
  getProperties,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats,
} from "./property.controller";
import {
  CreatePropertySchema,
  UpdatePropertySchema,
  PropertyFilterSchema,
} from "./property.schema";
import {
  addConfiguration,
  updateConfiguration,
  deleteConfiguration,
  ConfigurationSchema,
  UpdateConfigurationSchema,
} from "./configuration.controller";
import {
  getNearbyPlaces,
  addNearbyPlace,
  updateNearbyPlace,
  deleteNearbyPlace,
  NearbyPlaceSchema,
  UpdateNearbyPlaceSchema,
} from "./nearbyPlace.controller";
import {
  addFinancialMetric,
  updateFinancialMetric,
  deleteFinancialMetric,
  FinancialMetricSchema,
  UpdateFinancialMetricSchema,
} from "./financialMetric.controller";
import {
  assignAmenityToProperty,
  removeAmenityFromProperty,
} from "../amenity/amenity.controller";
import { AssignAmenitySchema } from "../amenity/amenity.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// ----------------------------------------------------
// Property Dashboard Stats (Must precede /:slug)
// ----------------------------------------------------
router.get(
  "/stats",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN, Role.CHANNEL_PARTNER),
  getPropertyStats,
);

// ----------------------------------------------------
// Public Property Listings & Details
// ----------------------------------------------------
router.get("/", validate(PropertyFilterSchema, "query"), getProperties);
router.get("/:slug", getPropertyBySlug);

// ----------------------------------------------------
// Property Management (SUPER_ADMIN)
// ----------------------------------------------------
router.post(
  "/",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(CreatePropertySchema),
  createProperty,
);

router.put(
  "/:id",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdatePropertySchema),
  updateProperty,
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  deleteProperty,
);

// ----------------------------------------------------
// Nested Unit Configurations (/api/v1/properties/:propertyId/configurations)
// ----------------------------------------------------
router.post(
  "/:propertyId/configurations",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(ConfigurationSchema),
  addConfiguration,
);

router.put(
  "/:propertyId/configurations/:configId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdateConfigurationSchema),
  updateConfiguration,
);

router.delete(
  "/:propertyId/configurations/:configId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  deleteConfiguration,
);

// ----------------------------------------------------
// Nested Property Amenities (/api/v1/properties/:propertyId/amenities)
// ----------------------------------------------------
router.post(
  "/:propertyId/amenities",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(AssignAmenitySchema),
  assignAmenityToProperty,
);

router.delete(
  "/:propertyId/amenities/:amenityId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  removeAmenityFromProperty,
);

// ----------------------------------------------------
// Nested Nearby Places (/api/v1/properties/:propertyId/nearby)
// ----------------------------------------------------
router.get("/:propertyId/nearby", getNearbyPlaces);

router.post(
  "/:propertyId/nearby",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(NearbyPlaceSchema),
  addNearbyPlace,
);

router.put(
  "/:propertyId/nearby/:placeId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdateNearbyPlaceSchema),
  updateNearbyPlace,
);

router.delete(
  "/:propertyId/nearby/:placeId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  deleteNearbyPlace,
);

// ----------------------------------------------------
// Nested Financial Metrics (/api/v1/properties/:propertyId/financials)
// ----------------------------------------------------
router.post(
  "/:propertyId/financials",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(FinancialMetricSchema),
  addFinancialMetric,
);

router.put(
  "/:propertyId/financials/:metricId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdateFinancialMetricSchema),
  updateFinancialMetric,
);

router.delete(
  "/:propertyId/financials/:metricId",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  deleteFinancialMetric,
);

export default router;
