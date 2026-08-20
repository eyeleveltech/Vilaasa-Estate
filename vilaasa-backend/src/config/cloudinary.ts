import "dotenv/config";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import path from "path";
import fs from "fs";
import os from "os";
import dotenv from "dotenv";

// Ensure .env is loaded regardless of execution CWD
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "vilaasa-backend/.env") });

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  resourceType: string;
  bytes: number;
}

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "cjhdssri";
  const apiKey = process.env.CLOUDINARY_API_KEY || "942266362419499";
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET || "14UkRpIECLJ1AzMU6lhmlXV1KNM";

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};

// Initial config run
getCloudinaryConfig();

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
