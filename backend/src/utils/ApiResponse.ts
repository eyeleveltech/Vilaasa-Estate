export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse<T = unknown> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: T;
  public meta?: PaginationMeta;

  constructor(
    statusCode: number,
    data: T,
    message = "Success",
    meta?: PaginationMeta,
  ) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  public static ok<T>(data: T, message = "Resource retrieved successfully", meta?: PaginationMeta): ApiResponse<T> {
    return new ApiResponse(200, data, message, meta);
  }

  public static created<T>(data: T, message = "Resource created successfully"): ApiResponse<T> {
    return new ApiResponse(201, data, message);
  }
}
