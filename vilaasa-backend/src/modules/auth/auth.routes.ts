import { Router } from "express";
import { register, login, getMe } from "./auth.controller";
import { RegisterSchema, LoginSchema } from "./auth.schema";
import { validate } from "../../middlewares/validate";
import { verifyJWT } from "../../middlewares/auth";

const router = Router();

router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login);
router.get("/me", verifyJWT, getMe);

export default router;
