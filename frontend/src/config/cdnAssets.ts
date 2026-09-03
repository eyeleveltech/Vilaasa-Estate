/**
 * Centralized Cloudinary CDN Asset URLs
 * Hosted securely on Cloudinary CDN for ultra-fast global delivery.
 * Original source files safely preserved in `media-archive/`.
 */

export const CDN_ASSETS = {
  domestic: {
    hero: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553129/vilaasa/domestic/domestic-hero.jpg",
    heritageVilla: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553128/vilaasa/domestic/heritage-villa.jpg",
    spaWellness: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553128/vilaasa/domestic/spa-wellness.jpg",
    videos: [
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553139/vilaasa/domestic/videos/video_1.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553141/vilaasa/domestic/videos/video_2.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553142/vilaasa/domestic/videos/video_3.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553143/vilaasa/domestic/videos/video_4.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553145/vilaasa/domestic/videos/video_5.mp4"
],
  },
  franchise: {
    wellnessKerala: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553130/vilaasa/franchises/wellness-resort-kerala.jpg",
    carltonSpa: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553131/vilaasa/franchises/carlton-wellness-spa.jpg",
    coltonResort: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553131/vilaasa/franchises/colton-beach-resort.jpg",
    ayurWellness: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553132/vilaasa/franchises/ayur-wellness-center.jpg",
    cafe: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553133/vilaasa/franchises/franchise-cafe.jpg",
    saloon: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553133/vilaasa/franchises/luxe-premium-saloon.jpg",
    zenSpa: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553134/vilaasa/franchises/zen-wellness-spa.jpg",
  },
  international: {
    videos: [
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553146/vilaasa/international/videos/video_1.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553147/vilaasa/international/videos/video_2.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553148/vilaasa/international/videos/video_3.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553150/vilaasa/international/videos/video_4.mp4"
],
    dubaiVideo: "https://res.cloudinary.com/cjhdssri/video/upload/v1787553161/vilaasa/international/videos/dubai.mp4",
  },
  hero: {
    villa: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553138/vilaasa/hero/hero-villa.jpg",
    videos: [
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553151/vilaasa/hero/videos/hero-video.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553152/vilaasa/hero/videos/hero-video-2.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553154/vilaasa/hero/videos/hero-video-3.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553155/vilaasa/hero/videos/hero-video-4.mp4",
    "https://res.cloudinary.com/cjhdssri/video/upload/v1787553156/vilaasa/hero/videos/hero-video-5.mp4"
],
  },
  brand: {
    intelligent: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553135/vilaasa/branding/Intelligent.jpg",
    intelligenceAbstract: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553136/vilaasa/branding/intelligence-abstract.jpg",
    marbleTexture: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553136/vilaasa/branding/marble-texture.jpg",
    splashBg: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553137/vilaasa/branding/splash-bg.jpg",
    dualPortfolio: "https://res.cloudinary.com/cjhdssri/image/upload/v1787553138/vilaasa/branding/dual-portfolio.jpg",
  },
} as const;

export default CDN_ASSETS;
