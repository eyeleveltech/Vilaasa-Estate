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
  const { email, phone, phoneCode = "+91", channel = "SMS", propertyName } = req.body;
  const { normalizePhoneNumber, sendOtpSms } = await import(
    "../../services/sms.service"
  );

  const { sendOtpEmail } = await import("../../services/email.service");

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  let normalizedPhone: string | null = null;
  if (phone) {
    const rawPhone = phone.trim().startsWith("+")
      ? phone.trim()
      : `${phoneCode} ${phone.trim()}`;
    normalizedPhone = normalizePhoneNumber(rawPhone, phoneCode);
  }

  const normalizedEmail = email ? email.toLowerCase().trim() : null;

  // Invalidate any previous unverified OTPs for this phone or email
  const deleteConditions: Array<{ email?: string; phone?: string }> = [];
  if (normalizedEmail) deleteConditions.push({ email: normalizedEmail });
  if (normalizedPhone) deleteConditions.push({ phone: normalizedPhone });

  if (deleteConditions.length > 0) {
    await prisma.otpRecord.deleteMany({
      where: {
        verified: false,
        OR: deleteConditions,
      },
    });
  }

  // Create new OTP record
  await prisma.otpRecord.create({
    data: {
      email: normalizedEmail,
      phone: normalizedPhone,
      channel,
      otp,
      expiresAt,
    },
  });

  // Dispatch via preferred channel
  if (channel === "SMS" && normalizedPhone) {
    const smsResult = await sendOtpSms(normalizedPhone, otp, propertyName);
    return res.status(200).json(

      ApiResponse.ok(
        {
          channel: "SMS",
          destination: normalizedPhone,
          expiresAt,
          mock: smsResult.messageId?.startsWith("mock-sms-") || false,
        },
        `One-time password sent successfully via SMS to ${normalizedPhone}`,
      ),
    );
  }

  // Default / Fallback: Dispatch luxury email
  if (normalizedEmail) {
    await sendOtpEmail(normalizedEmail, otp);
    return res.status(200).json(
      ApiResponse.ok(
        {
          channel: "EMAIL",
          destination: normalizedEmail,
          expiresAt,
        },
        `One-time password sent successfully to ${normalizedEmail}`,
      ),
    );
  }

  throw ApiError.badRequest("Valid phone number or email address required for OTP dispatch");
});

/**
 * @desc    Verify 6-digit OTP code and authenticate user
 * @route   POST /api/v1/auth/otp/verify
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, phoneCode = "+91", otp, channel = "SMS" } = req.body;
  const { normalizePhoneNumber, checkOtpWithTwilioVerify } = await import(
    "../../services/sms.service"
  );

  let normalizedPhone: string | null = null;
  if (phone) {
    const rawPhone = phone.trim().startsWith("+")
      ? phone.trim()
      : `${phoneCode} ${phone.trim()}`;
    normalizedPhone = normalizePhoneNumber(rawPhone, phoneCode);
  }
  const normalizedEmail = email ? email.toLowerCase().trim() : null;

  // Build lookup condition based on channel and provided credentials
  const searchConditions: Array<{ email?: string; phone?: string }> = [];
  if (channel === "SMS" && normalizedPhone) {
    searchConditions.push({ phone: normalizedPhone });
  } else if (channel === "EMAIL" && normalizedEmail) {
    searchConditions.push({ email: normalizedEmail });
  } else {
    if (normalizedPhone) searchConditions.push({ phone: normalizedPhone });
    if (normalizedEmail) searchConditions.push({ email: normalizedEmail });
  }

  if (searchConditions.length === 0) {
    throw ApiError.badRequest("Email or phone is required to verify OTP.");
  }

  const record = await prisma.otpRecord.findFirst({
    where: {
      verified: false,
      OR: searchConditions,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw ApiError.badRequest(
      "No active OTP found for this contact. Please request a new code.",
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

  // Verify OTP: Check local database code or Twilio Verify service
  let isVerified = false;
  if (record.otp === otp) {
    isVerified = true;
  } else if (channel === "SMS" && normalizedPhone) {
    const twilioVerifyResult = await checkOtpWithTwilioVerify(normalizedPhone, otp);
    if (twilioVerifyResult === true) {
      isVerified = true;
    }
  }

  if (!isVerified) {
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


  // Target email for user record
  const targetEmail =
    normalizedEmail ||
    record.email ||
    `vip-${(normalizedPhone || record.phone || "user").replace(/\D/g, "")}@vilaasa.internal`;

  // Check if existing user or auto-provision client user record
  let user = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user) {
    const dummyPasswordHash = await bcrypt.hash(
      `OtpClient@${Date.now()}_${Math.random()}`,
      10,
    );
    const defaultName = targetEmail
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    user = await prisma.user.create({
      data: {
        email: targetEmail,
        phone: normalizedPhone || record.phone,
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
        email: targetEmail,
        phone: normalizedPhone || record.phone,
        channel: record.channel,
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
