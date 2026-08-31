import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CDN_ASSETS } from "@/config/cdnAssets";
import { useState } from "react";

const Domestic = () => {
  const domesticHeroVideos = [
    "/domesticVideos/video_1.mp4",
    "/domesticVideos/video_2.mp4",
    "/domesticVideos/video_3.mp4",
    "/domesticVideos/video_4.mp4",
    "/domesticVideos/video_5.mp4",
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % domesticHeroVideos.length);
  };
  return (
    <div className="overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 gradient-overlay z-10" />
          {/* <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${domesticHero})` }}
          /> */}

          <video
            key={currentVideoIndex}
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          >
            <source src={domesticHeroVideos[currentVideoIndex]} type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20 flex max-w-[1280px] flex-col items-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col items-center gap-4 md:gap-6"
          >
            <h2 className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-primary md:mb-2 md:text-sm md:tracking-[0.3em]">
              Domestic Collection
            </h2>

            <h1 className="max-w-4xl font-luxia text-4xl font-light italic leading-[1.1] tracking-[-0.02em] text-foreground sm:text-5xl md:text-7xl lg:text-8xl">
              Roots & Returns.
            </h1>

            <div className="my-4 h-px w-20 bg-primary/50 md:my-6 md:w-24" />

            <p className="max-w-xl px-2 text-base font-light leading-relaxed text-foreground/80 md:px-0 md:text-xl">
              Curated assets for the discerning Indian investor.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-foreground/50"
        >
          <span className="material-symbols-outlined text-3xl">
            keyboard_arrow_down
          </span>
        </motion.div>
      </header>

      {/* Two Options Section */}
      <section className="bg-background px-4 py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-10 text-center md:mb-16"
          >
            <h2 className="text-2xl font-light leading-[1.1] text-foreground md:text-4xl lg:text-5xl">
              Choose Your{" "}
              <span className="font-serif italic text-primary">
                Investment Path
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground md:mt-4 md:text-lg">
              Two distinct avenues for building wealth and legacy in India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
            {/* Real Estate Card */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Link
                to="/domestic/real-estate"
                className="group relative block overflow-hidden rounded-sm border border-border bg-card transition-all duration-500 hover:border-primary/50"
              >
                <div className="relative min-h-[28rem] overflow-hidden sm:aspect-[16/10] sm:min-h-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${CDN_ASSETS.domestic.heritageVilla})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-primary sm:mb-3 sm:text-xs sm:tracking-[0.2em]">
                      Signature Real Estate
                    </span>
                    <h3 className="mb-2 text-2xl font-light leading-[1.1] text-foreground sm:mb-3 sm:text-3xl md:text-4xl">
                      Heritage Homes &{" "}
                      <span className="font-serif italic text-primary">
                        Tier-1 Assets
                      </span>
                    </h3>
                    <p className="mb-3 max-w-md text-sm leading-relaxed text-foreground/75 sm:mb-4 sm:text-base">
                      From ancestral villas to skyline apartments across India.
                      Homes that serve as a legacy.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-primary transition-all group-hover:gap-4">
                      View Properties
                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Franchise Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link
                to="/domestic/franchise"
                className="group relative block overflow-hidden rounded-sm border border-border bg-card transition-all duration-500 hover:border-gold/50"
              >
                <div className="relative min-h-[28rem] overflow-hidden sm:aspect-[16/10] sm:min-h-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${CDN_ASSETS.domestic.spaWellness})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gold sm:mb-3 sm:text-xs sm:tracking-[0.2em]">
                      Strategic Franchise Opportunities
                    </span>
                    <h3 className="mb-2 text-2xl font-light leading-[1.1] text-foreground sm:mb-3 sm:text-3xl md:text-4xl">
                      Business Ownership &{" "}
                      <span className="font-serif italic text-gold">
                        Expansion
                      </span>
                    </h3>
                    <p className="mb-3 max-w-md text-sm leading-relaxed text-foreground/75 sm:mb-4 sm:text-base">
                      Master Franchise rights for premier wellness, resort, and
                      lifestyle brands.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-gold transition-all group-hover:gap-4">
                      View Opportunities
                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Domestic;
