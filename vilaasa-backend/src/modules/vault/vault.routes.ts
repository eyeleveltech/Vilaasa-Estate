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
  getAdminVaultOverview,
  getAdminAllVaultAssets,
  getAdminInvestors,
  quickUpdateValuation,
  onboardInvestor,
  getVaultOverview,
  getVaultTenancy,
  getVaultDocuments,
  getVaultPayments,
  getVaultConstruction,
  getVaultConcierge,
  createVaultConciergeRequest,
  getVaultNominees,
  createVaultNominee,
  deleteVaultNominee,
  getVaultLegacyDocuments,
  createVaultLegacyDocument,
  deleteVaultLegacyDocument,
} from "./vault.controller";
import {
  CreateVaultAssetSchema,
  UpdateVaultAssetSchema,
  QuickUpdateValuationSchema,
  OnboardInvestorSchema,
  CreateConciergeRequestSchema,
  CreateNomineeSchema,
  CreateLegacyDocumentSchema,
} from "./vault.schema";
import { LoginSchema } from "../auth/auth.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Dedicated Investor login endpoint (Role gated to VAULT_CLIENT)
router.post("/login", validate(LoginSchema), vaultLogin);

// ====================================================
// INVESTOR PORTAL SECTIONS (Protected with verifyJWT)
// ====================================================
router.get("/overview", verifyJWT, getVaultOverview);
router.get("/portfolio", verifyJWT, getMyPortfolio);
router.get("/tenancy", verifyJWT, getVaultTenancy);
router.get("/documents", verifyJWT, getVaultDocuments);
router.get("/payments", verifyJWT, getVaultPayments);
router.get("/construction", verifyJWT, getVaultConstruction);

// Concierge Desk
router.get("/concierge", verifyJWT, getVaultConcierge);
router.post(
  "/concierge",
  verifyJWT,
  validate(CreateConciergeRequestSchema),
  createVaultConciergeRequest,
);

// Nominee & Succession
router.get("/nominees", verifyJWT, getVaultNominees);
router.post(
  "/nominees",
  verifyJWT,
  validate(CreateNomineeSchema),
  createVaultNominee,
);
router.delete("/nominees/:id", verifyJWT, deleteVaultNominee);

// Legacy & Estate Documents
router.get("/legacy-documents", verifyJWT, getVaultLegacyDocuments);
router.post(
  "/legacy-documents",
  verifyJWT,
  validate(CreateLegacyDocumentSchema),
  createVaultLegacyDocument,
);
router.delete("/legacy-documents/:id", verifyJWT, deleteVaultLegacyDocument);


// Super Admin specialized dashboard endpoints
router.post(
  "/admin/onboard-investor",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(OnboardInvestorSchema),
  onboardInvestor,
);

router.get(
  "/admin/overview",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  getAdminVaultOverview,
);

router.get(
  "/admin/assets",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  getAdminAllVaultAssets,
);

router.get(
  "/admin/investors",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  getAdminInvestors,
);

router.patch(
  "/admin/assets/:id/valuation",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(QuickUpdateValuationSchema),
  quickUpdateValuation,
);

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
