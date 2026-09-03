import { Router } from "express";
import { Role } from "@prisma/client";
import { register, login, getMe, sendOtp, verifyOtp } from "./auth.controller";
import {
  RegisterSchema,
  LoginSchema,
  SendOtpSchema,
  VerifyOtpSchema,
} from "./auth.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/role";

const router = Router();

// Account creation is SUPER_ADMIN-only. It accepts a caller-supplied `role`,
// so leaving it public would let anyone mint themselves a SUPER_ADMIN.
// Self-service partner signup is /channel-partners/register, which files a
// PENDING application and creates no login until an admin approves it.
router.post(
  "/register",
  verifyJWT,
  authorizeRoles(Role.SUPER_ADMIN),
  validate(RegisterSchema),
  register,
);
router.post("/login", validate(LoginSchema), login);
router.post("/otp/send", validate(SendOtpSchema), sendOtp);
router.post("/otp/verify", validate(VerifyOtpSchema), verifyOtp);
router.get("/me", verifyJWT, getMe);

export default router;
