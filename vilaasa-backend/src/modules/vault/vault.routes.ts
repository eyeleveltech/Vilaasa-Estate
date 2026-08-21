import { Router } from "express";
import { Role } from "@prisma/client";
import {
  vaultLogin,
  getMyPortfolio,
  getVaultAssetById,
  getAllVaultAssets,
  createVaultAsset,
  updateVaultAsset,
  deleteVaultAsset,
} from "./vault.controller";
import {
  CreateVaultAssetSchema,
  UpdateVaultAssetSchema,
} from "./vault.schema";
import { LoginSchema } from "../auth/auth.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Dedicated Investor login endpoint (Role gated to VAULT_CLIENT)
router.post("/login", validate(LoginSchema), vaultLogin);

// Client investor portfolio endpoint
router.get("/portfolio", verifyJWT, getMyPortfolio);

// Single vault asset detail (Client owner or Super Admin)
router.get("/assets/:id", verifyJWT, getVaultAssetById);

// Super Admin vault asset management
router.get("/", verifyJWT, authorizeRoles(Role.SUPER_ADMIN), getAllVaultAssets);
router.get("/assets", verifyJWT, authorizeRoles(Role.SUPER_ADMIN), getAllVaultAssets);

router.post(
  "/assets",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(CreateVaultAssetSchema),
  createVaultAsset,
);

router.put(
  "/assets/:id",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(UpdateVaultAssetSchema),
  updateVaultAsset,
);

router.delete(
  "/assets/:id",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  deleteVaultAsset,
);

export default router;
