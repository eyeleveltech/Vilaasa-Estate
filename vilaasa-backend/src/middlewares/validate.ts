import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

type ValidationTarget = "body" | "query" | "params";

/**
 * Validates request data (body, query, or params) against a Zod schema.
 */
export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = "body",
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`,
        );
        return next(
          ApiError.unprocessableEntity("Validation error", errorMessages),
        );
      }
      next(error);
    }
  };
};
