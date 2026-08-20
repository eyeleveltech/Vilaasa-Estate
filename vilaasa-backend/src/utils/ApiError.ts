export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: string[];

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: string[] = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors.length > 0 ? errors : [message];

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public static badRequest(message = "Bad request", errors: string[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  public static unauthorized(message = "Unauthorized request"): ApiError {
    return new ApiError(401, message);
  }

  public static forbidden(message = "Access forbidden"): ApiError {
    return new ApiError(403, message);
  }

  public static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message);
  }

  public static unprocessableEntity(message = "Validation error", errors: string[] = []): ApiError {
    return new ApiError(422, message, errors);
  }

  public static internal(message = "Internal server error"): ApiError {
    return new ApiError(500, message);
  }
}
