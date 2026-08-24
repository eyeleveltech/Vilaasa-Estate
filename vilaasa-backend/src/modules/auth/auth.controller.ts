import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { RegisterInput, LoginInput } from "./auth.schema";
import { sendVaultOnboardingEmail } from "../../services/email.service";

const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET || "default_jwt_secret";
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  return jwt.sign({ userId, email, role }, secret, { expiresIn });
};

/**
 * @desc    Register a new user (Channel Partner or Admin)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, phone, phoneCode, role, licenseNumber } =
    req.body as RegisterInput;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw ApiError.badRequest("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone,
      phoneCode,
      role,
      licenseNumber,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      phoneCode: true,
      role: true,
      avatar: true,
      licenseNumber: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = generateToken(user.id, user.email, user.role);

  if (role === "VAULT_CLIENT") {
    void sendVaultOnboardingEmail({
      name: user.name,
      email: user.email,
      password,
    }).catch((err) => {
      console.error("❌ Failed to send Vault onboarding email:", err);
    });
  }

  return res.status(201).json(
    ApiResponse.created(
      { user, token },
      "User account registered successfully",
    ),
  );
});

/**
 * @desc    Authenticate user and get JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account is deactivated. Contact admin.");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = generateToken(user.id, user.email, user.role);

  const userProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    phoneCode: user.phoneCode,
    role: user.role,
    avatar: user.avatar,
    licenseNumber: user.licenseNumber,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  return res.status(200).json(
    ApiResponse.ok(
      { user: userProfile, token },
      "Logged in successfully",
    ),
  );
});

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/v1/auth/me
 * @access  Protected (Requires Bearer token)
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      phoneCode: true,
      role: true,
      avatar: true,
      licenseNumber: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      assignedProperties: {
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return res.status(200).json(
    ApiResponse.ok(user, "User profile retrieved successfully"),
  );
});

/**
 * @desc    Send 6-digit OTP code to email for authentication / login / Vault access
 * @route   POST /api/v1/auth/otp/send
 * @access  Public
 */
export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Invalidate any previous unverified OTPs for this email
  await prisma.otpRecord.deleteMany({
    where: { email, verified: false },
  });

  // Create new OTP record
  await prisma.otpRecord.create({
    data: {
      email,
      otp,
      expiresAt,
    },
  });

  // Dispatch luxury email
  const { sendOtpEmail } = await import("../../services/email.service");
  await sendOtpEmail(email, otp);

  return res.status(200).json(
    ApiResponse.ok(
      { email, expiresAt },
      "One-time password sent successfully to your email",
    ),
  );
});

/**
 * @desc    Verify 6-digit OTP code and authenticate user
 * @route   POST /api/v1/auth/otp/verify
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const record = await prisma.otpRecord.findFirst({
    where: {
      email,
      verified: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw ApiError.badRequest(
      "No active OTP found for this email. Request a new code.",
    );
  }

  if (new Date() > record.expiresAt) {
    throw ApiError.badRequest(
      "OTP has expired. Please request a new security code.",
    );
  }

  if (record.attempts >= 5) {
    throw ApiError.forbidden(
      "Maximum OTP verification attempts exceeded. Request a new code.",
    );
  }

  if (record.otp !== otp) {
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw ApiError.badRequest("Invalid OTP code. Please check and try again.");
  }

  // Mark OTP as verified
  await prisma.otpRecord.update({
    where: { id: record.id },
    data: { verified: true },
  });

  // Check if existing user or auto-provision client user record
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const dummyPasswordHash = await bcrypt.hash(
      `OtpClient@${Date.now()}_${Math.random()}`,
      10,
    );
    const defaultName = email
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    user = await prisma.user.create({
      data: {
        email,
        passwordHash: dummyPasswordHash,
        name: defaultName,
        role: "CHANNEL_PARTNER",
      },
    });
  }

  const token = generateToken(user.id, user.email, user.role);

  return res.status(200).json(
    ApiResponse.ok(
      {
        verified: true,
        email,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      "OTP verified successfully",
    ),
  );
});
