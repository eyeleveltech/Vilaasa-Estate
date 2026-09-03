import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "❌ Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, " +
      "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env " +
      "before running this script.",
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const FRONTEND_DIR = path.resolve(__dirname, "../../frontend");
const ASSETS_DIR = path.join(FRONTEND_DIR, "src/assets");
const PUBLIC_DIR = path.join(FRONTEND_DIR, "public");
const ARCHIVE_DIR = path.resolve(__dirname, "../../media-archive");

interface AssetDefinition {
  sourcePath: string;
  category: "domestic" | "international" | "franchise" | "brand" | "hero" | "videos";
  cloudinaryFolder: string;
  key: string;
  archiveSubdir: string;
}

const ASSET_LIST: AssetDefinition[] = [
  // Domestic Images
  {
    sourcePath: path.join(ASSETS_DIR, "heritage-villa.jpg"),
    category: "domestic",
    cloudinaryFolder: "vilaasa/domestic",
    key: "heritageVilla",
    archiveSubdir: "domestic",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "spa-wellness.jpg"),
    category: "domestic",
    cloudinaryFolder: "vilaasa/domestic",
    key: "spaWellness",
    archiveSubdir: "domestic",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "domestic-hero.jpg"),
    category: "domestic",
    cloudinaryFolder: "vilaasa/domestic",
    key: "hero",
    archiveSubdir: "domestic",
  },

  // Franchise Images
  {
    sourcePath: path.join(ASSETS_DIR, "wellness-resort-kerala.jpg"),
    category: "franchise",
    cloudinaryFolder: "vilaasa/franchises",
    key: "wellnessKerala",
    archiveSubdir: "franchise",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "carlton-wellness-spa.jpg"),
    category: "franchise",
    cloudinaryFolder: "vilaasa/franchises",
    key: "carltonSpa",
    archiveSubdir: "franchise",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "colton-beach-resort.jpg"),
    category: "franchise",
    cloudinaryFolder: "vilaasa/franchises",
    key: "coltonResort",
    archiveSubdir: "franchise",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "ayur-wellness-center.jpg"),
    category: "franchise",
    cloudinaryFolder: "vilaasa/franchises",
    key: "ayurWellness",
    archiveSubdir: "franchise",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "franchise-cafe.jpg"),
    category: "franchise",
    cloudinaryFolder: "vilaasa/franchises",
    key: "cafe",
    archiveSubdir: "franchise",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "luxe-premium-saloon.jpg"),
    category: "franchise",
    cloudinaryFolder: "vilaasa/franchises",
    key: "saloon",
    archiveSubdir: "franchise",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "zen-wellness-spa.jpg"),
    category: "franchise",
    cloudinaryFolder: "vilaasa/franchises",
    key: "zenSpa",
    archiveSubdir: "franchise",
  },

  // Brand / Architecture Images
  {
    sourcePath: path.join(ASSETS_DIR, "Intelligent.jpg"),
    category: "brand",
    cloudinaryFolder: "vilaasa/branding",
    key: "intelligent",
    archiveSubdir: "brand",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "intelligence-abstract.jpg"),
    category: "brand",
    cloudinaryFolder: "vilaasa/branding",
    key: "intelligenceAbstract",
    archiveSubdir: "brand",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "marble-texture.jpg"),
    category: "brand",
    cloudinaryFolder: "vilaasa/branding",
    key: "marbleTexture",
    archiveSubdir: "brand",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "splash-bg.jpg"),
    category: "brand",
    cloudinaryFolder: "vilaasa/branding",
    key: "splashBg",
    archiveSubdir: "brand",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "dual-portfolio.jpg"),
    category: "brand",
    cloudinaryFolder: "vilaasa/branding",
    key: "dualPortfolio",
    archiveSubdir: "brand",
  },
  {
    sourcePath: path.join(ASSETS_DIR, "hero-villa.jpg"),
    category: "hero",
    cloudinaryFolder: "vilaasa/hero",
    key: "villa",
    archiveSubdir: "hero",
  },

  // Domestic Hero Videos (public/domesticVideos/)
  {
    sourcePath: path.join(PUBLIC_DIR, "domesticVideos/video_1.mp4"),
    category: "domestic",
    cloudinaryFolder: "vilaasa/domestic/videos",
    key: "video1",
    archiveSubdir: "domestic/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "domesticVideos/video_2.mp4"),
    category: "domestic",
    cloudinaryFolder: "vilaasa/domestic/videos",
    key: "video2",
    archiveSubdir: "domestic/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "domesticVideos/video_3.mp4"),
    category: "domestic",
    cloudinaryFolder: "vilaasa/domestic/videos",
    key: "video3",
    archiveSubdir: "domestic/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "domesticVideos/video_4.mp4"),
    category: "domestic",
    cloudinaryFolder: "vilaasa/domestic/videos",
    key: "video4",
    archiveSubdir: "domestic/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "domesticVideos/video_5.mp4"),
    category: "domestic",
    cloudinaryFolder: "vilaasa/domestic/videos",
    key: "video5",
    archiveSubdir: "domestic/videos",
  },

  // International Hero Videos (public/internationalVideo/)
  {
    sourcePath: path.join(PUBLIC_DIR, "internationalVideo/video_1.mp4"),
    category: "international",
    cloudinaryFolder: "vilaasa/international/videos",
    key: "video1",
    archiveSubdir: "international/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "internationalVideo/video_2.mp4"),
    category: "international",
    cloudinaryFolder: "vilaasa/international/videos",
    key: "video2",
    archiveSubdir: "international/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "internationalVideo/video_3.mp4"),
    category: "international",
    cloudinaryFolder: "vilaasa/international/videos",
    key: "video3",
    archiveSubdir: "international/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "internationalVideo/video_4.mp4"),
    category: "international",
    cloudinaryFolder: "vilaasa/international/videos",
    key: "video4",
    archiveSubdir: "international/videos",
  },

  // Public Hero Videos (public/videos/)
  {
    sourcePath: path.join(PUBLIC_DIR, "videos/hero-video.mp4"),
    category: "hero",
    cloudinaryFolder: "vilaasa/hero/videos",
    key: "heroVideo1",
    archiveSubdir: "hero/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "videos/hero-video-2.mp4"),
    category: "hero",
    cloudinaryFolder: "vilaasa/hero/videos",
    key: "heroVideo2",
    archiveSubdir: "hero/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "videos/hero-video-3.mp4"),
    category: "hero",
    cloudinaryFolder: "vilaasa/hero/videos",
    key: "heroVideo3",
    archiveSubdir: "hero/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "videos/hero-video-4.mp4"),
    category: "hero",
    cloudinaryFolder: "vilaasa/hero/videos",
    key: "heroVideo4",
    archiveSubdir: "hero/videos",
  },
  {
    sourcePath: path.join(PUBLIC_DIR, "videos/hero-video-5.mp4"),
    category: "hero",
    cloudinaryFolder: "vilaasa/hero/videos",
    key: "heroVideo5",
    archiveSubdir: "hero/videos",
  },
];

// Optional large Dubai video
const dubaiVideoPath = path.join(ASSETS_DIR, "dubai.mp4");
if (fs.existsSync(dubaiVideoPath)) {
  ASSET_LIST.push({
    sourcePath: dubaiVideoPath,
    category: "international",
    cloudinaryFolder: "vilaasa/international/videos",
    key: "dubaiVideo",
    archiveSubdir: "international/videos",
  });
}

async function uploadFile(item: AssetDefinition): Promise<string> {
  const filename = path.basename(item.sourcePath);
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);
  const isVideo = ext.toLowerCase() === ".mp4";

  console.log(`⏳ Uploading ${filename} (${isVideo ? "Video" : "Image"}) to ${item.cloudinaryFolder}...`);

  try {
    const result = await cloudinary.uploader.upload(item.sourcePath, {
      folder: item.cloudinaryFolder,
      public_id: `${nameWithoutExt}`,
      resource_type: isVideo ? "video" : "image",
      overwrite: true,
    });

    console.log(`✅ Uploaded ${filename} -> ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Failed to upload ${filename}:`, error);
    throw error;
  }
}

async function moveFileToArchive(item: AssetDefinition) {
  const destDir = path.join(ARCHIVE_DIR, item.archiveSubdir);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const filename = path.basename(item.sourcePath);
  const destPath = path.join(destDir, filename);

  // Copy to archive, then delete original
  fs.copyFileSync(item.sourcePath, destPath);
  fs.unlinkSync(item.sourcePath);
  console.log(`📦 Archived: ${filename} -> media-archive/${item.archiveSubdir}/${filename}`);
}

async function main() {
  console.log("🚀 Starting Cloudinary Media Migration & Local Asset Organization...\n");

  const results: Record<string, Record<string, string>> = {
    domestic: {},
    franchise: {},
    international: {},
    hero: {},
    brand: {},
  };

  const domesticVideos: string[] = [];
  const internationalVideos: string[] = [];
  const heroVideos: string[] = [];

  for (const item of ASSET_LIST) {
    if (!fs.existsSync(item.sourcePath)) {
      console.warn(`⚠️ File not found, skipping: ${item.sourcePath}`);
      continue;
    }

    const secureUrl = await uploadFile(item);

    if (item.category === "domestic" && item.key.startsWith("video")) {
      domesticVideos.push(secureUrl);
    } else if (item.category === "international" && item.key.startsWith("video")) {
      internationalVideos.push(secureUrl);
    } else if (item.category === "hero" && item.key.startsWith("heroVideo")) {
      heroVideos.push(secureUrl);
    } else {
      results[item.category][item.key] = secureUrl;
    }

    // Safely move file to media-archive/
    await moveFileToArchive(item);
  }

  // Clean up empty directories in public/ if empty
  const publicDirsToClean = [
    path.join(PUBLIC_DIR, "domesticVideos"),
    path.join(PUBLIC_DIR, "internationalVideo"),
    path.join(PUBLIC_DIR, "videos"),
  ];

  for (const d of publicDirsToClean) {
    if (fs.existsSync(d) && fs.readdirSync(d).length === 0) {
      fs.rmdirSync(d);
      console.log(`🧹 Cleaned up empty folder: ${path.relative(FRONTEND_DIR, d)}`);
    }
  }

  // Generate cdnAssets.ts
  const cdnAssetsContent = `/**
 * Centralized Cloudinary CDN Asset URLs
 * Hosted securely on Cloudinary CDN for ultra-fast global delivery.
 * Original source files safely preserved in \`media-archive/\`.
 */

export const CDN_ASSETS = {
  domestic: {
    hero: "${results.domestic.hero || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/domestic/domestic-hero.jpg"}",
    heritageVilla: "${results.domestic.heritageVilla || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/domestic/heritage-villa.jpg"}",
    spaWellness: "${results.domestic.spaWellness || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/domestic/spa-wellness.jpg"}",
    videos: ${JSON.stringify(domesticVideos, null, 4)},
  },
  franchise: {
    wellnessKerala: "${results.franchise.wellnessKerala || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/franchises/wellness-resort-kerala.jpg"}",
    carltonSpa: "${results.franchise.carltonSpa || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/franchises/carlton-wellness-spa.jpg"}",
    coltonResort: "${results.franchise.coltonResort || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/franchises/colton-beach-resort.jpg"}",
    ayurWellness: "${results.franchise.ayurWellness || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/franchises/ayur-wellness-center.jpg"}",
    cafe: "${results.franchise.cafe || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/franchises/franchise-cafe.jpg"}",
    saloon: "${results.franchise.saloon || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/franchises/luxe-premium-saloon.jpg"}",
    zenSpa: "${results.franchise.zenSpa || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/franchises/zen-wellness-spa.jpg"}",
  },
  international: {
    videos: ${JSON.stringify(internationalVideos, null, 4)},
    dubaiVideo: "${results.international.dubaiVideo || ""}",
  },
  hero: {
    villa: "${results.hero.villa || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/hero/hero-villa.jpg"}",
    videos: ${JSON.stringify(heroVideos, null, 4)},
  },
  brand: {
    intelligent: "${results.brand.intelligent || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/branding/Intelligent.jpg"}",
    intelligenceAbstract: "${results.brand.intelligenceAbstract || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/branding/intelligence-abstract.jpg"}",
    marbleTexture: "${results.brand.marbleTexture || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/branding/marble-texture.jpg"}",
    splashBg: "${results.brand.splashBg || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/branding/splash-bg.jpg"}",
    dualPortfolio: "${results.brand.dualPortfolio || "https://res.cloudinary.com/cjhdssri/image/upload/v1/vilaasa/branding/dual-portfolio.jpg"}",
  },
} as const;

export default CDN_ASSETS;
`;

  const cdnAssetsFile = path.join(FRONTEND_DIR, "src/config/cdnAssets.ts");
  const configDir = path.dirname(cdnAssetsFile);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(cdnAssetsFile, cdnAssetsContent, "utf-8");
  console.log(`\n✨ Generated: ${path.relative(FRONTEND_DIR, cdnAssetsFile)}`);
  console.log("🎉 Cloudinary Media Migration & Local Organization Complete!\n");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
