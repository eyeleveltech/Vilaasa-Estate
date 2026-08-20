import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const partners = [
  {
    name: "Carlton",
    slug: "carlton",
    tagline: "Luxury Experiences • Andhra Pradesh",
    icon: "hotel_class",
  },
  {
    name: "Oxygen Forest",
    slug: "oxygen-forest",
    tagline: "Luxury Farm Living • Hyderabad",
    icon: "park",
  },
];

const heroVideos = [
  "/videos/hero-video.mp4",
  "/videos/hero-video-2.mp4",
  "/videos/hero-video-3.mp4",
  "/videos/hero-video-4.mp4",
  "/videos/hero-video-5.mp4",
];

export const HeroSection = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    const nextIndex = (currentVideoIndex + 1) % heroVideos.length;
    setCurrentVideoIndex(nextIndex);
  };

  const moveToNextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % heroVideos.length);
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    setVideoFailed(false);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setVideoFailed(true);
      });
    }
  }, [currentVideoIndex]);

  return (
    <header className="relative flex min-h-screen w-full flex-col justify-center items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 gradient-overlay z-10" />
        <video
          ref={videoRef}
          key={currentVideoIndex}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          onCanPlay={() => setVideoFailed(false)}
          onError={() => {
            setVideoFailed(true);
            moveToNextVideo();
          }}
          className="w-full h-full object-cover"
          style={{ opacity: videoFailed ? 0 : 1 }}
        >
          <source src={heroVideos[currentVideoIndex]} type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-20 px-4 max-w-[1280px] flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-col md:gap-6 items-center"
        >
          <h1 className="text-foreground text-5xl md:text-7xl lg:text-8xl font-light leading-[1.1] tracking-[-0.02em] max-w-4xl font-luxia drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            The Luxury of <br />
            <span className="text-foreground/90">Certainty</span>
          </h1>

          <div className="hidden lg:block h-px w-24 bg-primary/50 my-6 shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />

          <p className="text-foreground/80 text-base md:text-xl font-light leading-relaxed max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            We believe true luxury is the absence of worry.
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 animate-bounce text-foreground/50"
      >
        <span className="material-symbols-outlined text-3xl">
          keyboard_arrow_down
        </span>
      </motion.div>

      {/* Partner Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 z-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-foreground/10 bg-background/80 backdrop-blur-md">
          {partners.map((partner, index) => (
            <Link
              key={index}
              to={`/property/${partner.slug}`}
            >
              <div className="flex items-center justify-between px-6 md:px-8 py-5 group cursor-pointer hover:bg-foreground/5 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-primary font-medium text-base md:text-lg">
                    {partner.name}
                  </span>
                  <span className="text-foreground/60 text-sm">
                    {partner.tagline}
                  </span>
                </div>
                <span className="material-symbols-outlined text-3xl text-foreground/40 group-hover:text-primary transition-colors">
                  {partner.icon}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </header>
  );
};
