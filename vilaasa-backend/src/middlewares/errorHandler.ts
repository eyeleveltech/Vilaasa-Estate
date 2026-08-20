import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  // 1. Handled Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    const errorMessages = err.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`,
    );
    return res.status(422).json({
      success: false,
      statusCode: 422,
      message: "Validation Error",
      errors: errorMessages,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = Array.isArray(err.meta?.target)
          ? err.meta.target.join(", ")
          : (err.meta?.target as string) || "field";
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: `A unique constraint failed on: ${target}`,
          errors: [`Duplicate entry for ${target}`],
        });
      }
      case "P2025":
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Record not found",
          errors: ["The requested database record does not exist"],
        });
      case "P2003":
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Foreign key constraint failed",
          errors: ["Referenced record does not exist"],
        });
      default:
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: `Database Error: ${err.message}`,
          errors: [err.message],
        });
    }
  }

  // 4. JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid authentication token",
      errors: [err.message],
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Authentication token has expired",
      errors: [err.message],
    });
  }

  // 5. Default Unhandled 500 Internal Server Error
  console.error("❌ Unhandled Error:", err);

  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    errors: [err.message || "An unexpected error occurred"],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
