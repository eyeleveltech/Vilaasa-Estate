import { Router } from "express";
import { register, login, getMe, sendOtp, verifyOtp } from "./auth.controller";
import {
  RegisterSchema,
  LoginSchema,
  SendOtpSchema,
  VerifyOtpSchema,
} from "./auth.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";

const router = Router();

router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login);
router.post("/otp/send", validate(SendOtpSchema), sendOtp);
router.post("/otp/verify", validate(VerifyOtpSchema), verifyOtp);
router.get("/me", verifyJWT, getMe);

export default router;
