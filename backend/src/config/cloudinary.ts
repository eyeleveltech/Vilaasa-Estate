import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { env, isCloudinaryConfigured } from "./env";

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  resourceType: string;
  bytes: number;
}

/**
 * Applies credentials from the validated environment. Credentials are never
 * hardcoded: without them the SDK stays unconfigured and uploads fail loudly
 * instead of writing into an unrelated Cloudinary account.
 */
const getCloudinaryConfig = () => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, " +
        "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable media uploads.",
    );
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

if (isCloudinaryConfigured()) {
  getCloudinaryConfig();
} else {
  console.warn(
    "⚠️  Cloudinary credentials are not set — media uploads will be rejected.",
  );
}

/**
 * Uploads a memory buffer to Cloudinary.
 * Handles PDFs natively as image resources for full multi-page document support.
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder = "vilaasa/properties",
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
  originalFilename?: string,
): Promise<UploadResult> => {
  getCloudinaryConfig();

  const sanitizedName = originalFilename
    ? originalFilename
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/\.[^/.]+$/, "")
    : "asset";

  const isPdf =
    originalFilename?.toLowerCase().endsWith(".pdf") ||
    resourceType === "image";

  // Upload in-memory stream
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: resourceType,
      public_id: `${sanitizedName}_${Date.now()}`,
    };

    // If PDF uploaded as image, specify format as pdf so URL ends in .pdf
    if (originalFilename?.toLowerCase().endsWith(".pdf")) {
      uploadOptions.format = "pdf";
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary Upload Error:", {
            message: error?.message,
            http_code: error?.http_code,
            resource_type: resourceType,
            file_bytes: fileBuffer.length,
          });
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format || (isPdf ? "pdf" : "jpg"),
          resourceType: result.resource_type,
          bytes: result.bytes,
        });
      },
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an asset from Cloudinary by public ID.
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<void> => {
  getCloudinaryConfig();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export { cloudinary };
