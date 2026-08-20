import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import dualPortfolioImage from "@/assets/dual-portfolio.jpg";

export const DualPortfolioSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-10 bg-card" id="opportunities">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col gap-8 order-2 lg:order-1"
        >
          <div className="flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold">
              Strategy
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-foreground leading-[1.1]">
              The Dual <br />
              <span className="font-serif italic">Portfolio</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mt-2">
              Why choose between lifestyle and leverage? Our proprietary model
              allows members to hold fractional ownership in high-yield
              commercial franchises while enjoying exclusive access to our
              residential estate collection globally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Link
              to="/domestic/real-estate"
              className="p-6 rounded bg-background border border-border hover:border-primary/50 transition-all hover:shadow-lg text-left group"
            >
              <span className="material-symbols-outlined text-3xl text-primary mb-4 group-hover:scale-110 transition-transform">
                villa
              </span>
              <h4 className="text-lg font-bold text-foreground mb-2">
                The Estate
              </h4>
              <p className="text-sm text-muted-foreground">
                Ultra-luxury residences in prime global capitals.
              </p>
              <span className="inline-flex items-center gap-1 text-primary text-xs font-bold mt-3 group-hover:gap-2 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>
            <Link
              to="/domestic/franchise"
              className="p-6 rounded bg-background border border-border hover:border-primary/50 transition-all hover:shadow-lg text-left group"
            >
              <span className="material-symbols-outlined text-3xl text-primary mb-4 group-hover:scale-110 transition-transform">
                trending_up
              </span>
              <h4 className="text-lg font-bold text-foreground mb-2">
                The Franchise
              </h4>
              <p className="text-sm text-muted-foreground">
                High-performance commercial assets delivering quarterly yields.
              </p>
              <span className="inline-flex items-center gap-1 text-primary text-xs font-bold mt-3 group-hover:gap-2 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>
          </div>

        
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative order-1 lg:order-2 group cursor-pointer overflow-hidden rounded-lg aspect-[4/5] lg:aspect-square shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <div
            className="w-full h-full bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
            style={{ backgroundImage: `url(${dualPortfolioImage})` }}
          />
          <div className="absolute top-6 right-6 z-20">
            <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">
              Yield + Leisure
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
