import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { RegisterInput, LoginInput } from "./auth.schema";

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
