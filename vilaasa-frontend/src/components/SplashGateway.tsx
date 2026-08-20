import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DiamondIcon } from "./icons/DiamondIcon";
import splashBg from "@/assets/splash-bg.jpg";

export const SplashGateway = () => {
  const navigate = useNavigate();

  const handleDomestic = () => {
    // onDismiss();
    navigate("/domestic");
  };

  const handleInternational = () => {
    // onDismiss();
    navigate("/international");
  };

  const handleExploreBoth = () => {
    navigate("/home");
    // onDismiss();
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] bg-black"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${splashBg})`,
              filter: "blur(2px) brightness(0.4)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center px-4 py-8 text-center sm:px-6 sm:py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6 sm:mb-8 md:mb-10"
            >
              <DiamondIcon className="text-4xl text-primary animate-pulse sm:text-5xl md:text-6xl" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-4 text-3xl font-light leading-[1.1] text-foreground drop-shadow-2xl sm:mb-5 sm:text-4xl md:mb-6 md:text-6xl lg:text-7xl font-luxia"
            >
              Where do you wish to <br />
              <span className="italic text-primary">build your legacy?</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mb-8 text-sm font-light uppercase tracking-[0.2em] text-muted-foreground text-shadow-sm sm:mb-10 sm:text-base md:mb-14 md:text-xl md:tracking-widest"
            >
              The luxury of certainty awaits.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6"
            >
              {/* International */}
              <button
                onClick={handleInternational}
                className="group relative flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-sm border border-border/30 p-5 transition-all duration-500 hover:border-gold/50 hover:bg-foreground/10 sm:min-h-[132px] sm:gap-3 sm:p-6 md:min-h-[148px] md:p-8 glass"
              >
                <span className="material-symbols-outlined text-2xl text-muted-foreground transition-colors group-hover:text-gold sm:text-3xl">
                  public
                </span>
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-colors group-hover:text-gold sm:text-sm sm:tracking-[0.2em]">
                    International
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground/80">
                    Dubai & Global Assets
                  </span>
                </div>
              </button>

              {/* Explore - Featured */}
              <button
                onClick={handleExploreBoth}
                className="group relative z-20 flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-sm border border-[#12d363] bg-[#12d363] p-5 shadow-[0_0_24px_rgba(18,211,99,0.28)] transition-all duration-500 hover:bg-foreground hover:shadow-[0_0_44px_rgba(255,255,255,0.3)] sm:min-h-[132px] sm:gap-3 sm:p-6 md:min-h-[148px] md:-translate-y-4 md:scale-105 md:p-8"
              >
                <span className="material-symbols-outlined text-2xl text-background transition-colors group-hover:text-background sm:text-3xl">
                  travel_explore
                </span>
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-background transition-colors group-hover:text-background sm:text-sm sm:tracking-[0.2em]">
                    Explore
                  </span>
                  <span className="text-[10px] text-background/80 font-bold uppercase tracking-wider group-hover:text-background/70">
                    Enter Main Site
                  </span>
                </div>
              </button>

              {/* Domestic */}
              <button
                onClick={handleDomestic}
                className="group relative flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-sm border border-border/30 p-5 transition-all duration-500 hover:border-primary/50 hover:bg-foreground/10 sm:min-h-[132px] sm:gap-3 sm:p-6 md:min-h-[148px] md:p-8 glass"
              >
                <span className="material-symbols-outlined text-2xl text-muted-foreground transition-colors group-hover:text-primary sm:text-3xl">
                  temple_hindu
                </span>
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-colors group-hover:text-primary sm:text-sm sm:tracking-[0.2em]">
                    Domestic
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground/80">
                    India Real Estate & Franchises
                  </span>
                </div>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="mt-7 text-[10px] uppercase tracking-[0.18em] text-foreground/35 sm:mt-10 sm:text-xs sm:tracking-widest md:mt-12"
            >
              Select a region to tailor your experience
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
