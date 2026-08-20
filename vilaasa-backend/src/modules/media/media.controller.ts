import { Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../../config/db";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../config/cloudinary";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

// Multer in-memory storage config
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "video/mp4",
      "video/quicktime",
      "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file format. Allowed: JPEG, PNG, WEBP, AVIF, MP4, MOV, PDF.",
        ),
      );
    }
  },
});

export const ReorderMediaSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1, "Media ID is required"),
      orderIndex: z.number().int().nonnegative(),
    }),
  ),
});

export type ReorderMediaInput = z.infer<typeof ReorderMediaSchema>;

/**
 * @desc    Upload media file to Cloudinary and link to Property
 * @route   POST /api/v1/media/upload/:propertyId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const {
    mediaType = "GALLERY",
    altText,
    isFeatured,
    orderIndex,
  } = req.body;

  if (!req.file) {
    throw ApiError.badRequest("No file uploaded");
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property || property.isDeleted) {
    throw ApiError.notFound(`Property with id '${propertyId}' not found`);
  }

  const isFeaturedBool = isFeatured === "true" || isFeatured === true;

  // If isFeatured=true, unset isFeatured on all other media for this property first
  if (isFeaturedBool) {
    await prisma.propertyMedia.updateMany({
      where: { propertyId, isFeatured: true },
      data: { isFeatured: false },
    });
  }

  // Determine resource type: videos use "video", images and PDFs use "image"
  let resourceType: "image" | "video" | "raw" = "image";
  if (req.file.mimetype.startsWith("video/")) {
    resourceType = "video";
  }

  const folder = `vilaasa/${property.id}/${mediaType}`;
  const uploadResult = await uploadToCloudinary(
    req.file.buffer,
    folder,
    resourceType,
    req.file.originalname,
  );

  const isPdf =
    req.file.mimetype === "application/pdf" || mediaType === "BROCHURE_PDF";

  let thumbnailUrl: string | undefined = undefined;
  if (resourceType === "image" && !isPdf) {
    thumbnailUrl = uploadResult.secureUrl.replace(
      "/upload/",
      "/upload/w_400,h_300,c_fill,q_auto,f_auto/",
    );
  }

  const mediaRecord = await prisma.propertyMedia.create({
    data: {
      propertyId,
      mediaType: mediaType as string,
      url: uploadResult.secureUrl,
      thumbnailUrl,
      altText: (altText as string) || `${property.name} Media Asset`,
      orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0,
      isFeatured: isFeaturedBool,
    },
  });

  return res.status(201).json(
    ApiResponse.created(
      mediaRecord,
      "Media uploaded and associated with property successfully",
    ),
  );
});

/**
 * @desc    Upload a standalone file (e.g. Brochure PDF, document, photo) to Cloudinary
 * @route   POST /api/v1/media/upload
 * @access  Protected (SUPER_ADMIN)
 */
export const uploadStandaloneMedia = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest("No file provided for upload");
    }

    const { folder = "vilaasa/brochures" } = req.body;

    // Videos use "video", PDFs and photos use "image"
    let resourceType: "image" | "video" | "raw" = "image";
    if (req.file.mimetype.startsWith("video/")) {
      resourceType = "video";
    }

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      folder,
      resourceType,
      req.file.originalname,
    );

    return res.status(201).json(
      ApiResponse.created(
        {
          url: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
          format: uploadResult.format,
          size: uploadResult.bytes,
          originalName: req.file.originalname,
        },
        "File uploaded to Cloudinary successfully",
      ),
    );
  },
);

/**
 * @desc    Batch reorder media items for a property
 * @route   PATCH /api/v1/media/reorder/:propertyId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const reorderMedia = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const { items } = req.body as ReorderMediaInput;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with id '${propertyId}' not found`);
    }

    const updates = items.map((item) =>
      prisma.propertyMedia.update({
        where: { id: item.id },
        data: { orderIndex: item.orderIndex },
      }),
    );

    await prisma.$transaction(updates);

    const updatedMedia = await prisma.propertyMedia.findMany({
      where: { propertyId },
      orderBy: { orderIndex: "asc" },
    });

    return res.status(200).json(
      ApiResponse.ok(updatedMedia, "Media ordered successfully"),
    );
  },
);

/**
 * @desc    Delete media item from Cloudinary and database
 * @route   DELETE /api/v1/media/:mediaId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const { mediaId } = req.params;

  const mediaRecord = await prisma.propertyMedia.findUnique({
    where: { id: mediaId },
  });

  if (!mediaRecord) {
    throw ApiError.notFound(`Media record with id '${mediaId}' not found`);
  }

  // Extract public ID from Cloudinary URL
  try {
    const urlParts = mediaRecord.url.split("/");
    const filenameWithExt = urlParts[urlParts.length - 1];
    const filename = filenameWithExt.split(".")[0];
    const folderIndex = urlParts.indexOf("vilaasa");
    if (folderIndex !== -1) {
      const folderPath = urlParts
        .slice(folderIndex, urlParts.length - 1)
        .join("/");
      const publicId = `${folderPath}/${filename}`;
      const resourceType = mediaRecord.url.includes("/video/")
        ? "video"
        : mediaRecord.url.endsWith(".pdf")
          ? "raw"
          : "image";
      await deleteFromCloudinary(publicId, resourceType);
    }
  } catch (error) {
    console.warn("⚠️ Could not destroy Cloudinary asset:", error);
  }

  const wasFeatured = mediaRecord.isFeatured;
  const propertyId = mediaRecord.propertyId;

  await prisma.propertyMedia.delete({
    where: { id: mediaId },
  });

  // If deleted media was featured, promote next media with lowest orderIndex
  if (wasFeatured) {
    const nextMedia = await prisma.propertyMedia.findFirst({
      where: { propertyId },
      orderBy: { orderIndex: "asc" },
    });

    if (nextMedia) {
      await prisma.propertyMedia.update({
        where: { id: nextMedia.id },
        data: { isFeatured: true },
      });
    }
  }

  return res.status(200).json(
    ApiResponse.ok(null, "Media deleted successfully"),
  );
});

/**
 * @desc    Get all media for a property grouped by mediaType
 * @route   GET /api/v1/media/:propertyId
 * @access  Public
 */
export const getPropertyMedia = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with id '${propertyId}' not found`);
    }

    interface MediaRecord {
      id: string;
      propertyId: string;
      mediaType: string;
      url: string;
      thumbnailUrl: string | null;
      altText: string | null;
      orderIndex: number;
      isFeatured: boolean;
      createdAt: Date;
    }

    const allMedia: MediaRecord[] = await prisma.propertyMedia.findMany({
      where: { propertyId },
      orderBy: { orderIndex: "asc" },
    });

    const heroImage = allMedia.find(
      (m: MediaRecord) => m.mediaType === "HERO_IMAGE" || m.isFeatured,
    );
    const gallery = allMedia.filter((m: MediaRecord) => m.mediaType === "GALLERY");
    const brochure = allMedia.find((m: MediaRecord) => m.mediaType === "BROCHURE_PDF");
    const video = allMedia.find((m: MediaRecord) => m.mediaType === "VIDEO_MP4");
    const tour360 = allMedia.find((m: MediaRecord) => m.mediaType === "TOUR_360");
    const floorPlans = allMedia.filter((m: MediaRecord) => m.mediaType === "FLOOR_PLAN");

    return res.status(200).json(
      ApiResponse.ok(
        {
          heroImage: heroImage || null,
          gallery,
          brochure: brochure || null,
          video: video || null,
          tour360: tour360 || null,
          floorPlans,
          all: allMedia,
        },
        "Property media retrieved successfully",
      ),
    );
  },
);
