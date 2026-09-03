import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Role } from "@prisma/client";

interface JwtPayload {
  userId?: string;
  id?: string;
  role: Role;
  email?: string;
}

export const verifyJWT = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Authentication token is missing");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Bearer token is missing");
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw ApiError.unauthorized("Authentication token is invalid or expired");
    }

    const userId = decoded.userId || decoded.id;
    if (!userId && !decoded.email) {
      throw ApiError.unauthorized("Invalid token structure");
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(decoded.email ? [{ email: decoded.email }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        isActive: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized("User account no longer exists");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Your account has been deactivated");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  },
);
