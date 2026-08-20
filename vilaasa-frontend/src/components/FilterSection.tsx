import { motion } from "framer-motion";
import intelligenceImage from "@/assets/Intelligent.jpg";

export const FilterSection = () => {
  return (
    <section className="relative py-24 md:py-36 px-4 md:px-10 bg-card" id="estate">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="lg:col-span-5 flex flex-col gap-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-primary/80 mb-2">
              <span className="h-px w-8 bg-current" />
              <span className="uppercase tracking-[0.2em] text-xs font-bold">
                The Filter
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1]">
              The Intelligent <br />
              <span className="font-serif italic text-primary/90">Filter.</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mt-4 font-light">
              The market is noisy. We reject 90% of opportunities to bring you
              the elite few—whether it is a dollar-denominated asset in Dubai or
              a high-yield franchise in India.
            </p>
          </div>

          
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="lg:col-span-7 relative pl-0 lg:pl-12 mt-10 lg:mt-0"
        >
          <div className="relative overflow-hidden rounded-sm aspect-[4/3] lg:aspect-[16/10]">
            <div
              className="w-full h-full bg-cover bg-center transform hover:scale-105 transition-transform duration-[1.5s] ease-out"
              style={{
                backgroundImage: `url(${intelligenceImage})`,
                filter: "contrast(1.1) brightness(0.9)",
              }}
            />
            <div className="absolute bottom-0 left-0 bg-background/90 text-foreground p-6 backdrop-blur-sm border-t border-r border-border max-w-xs">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  filter_alt
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Strict Selection
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Only the top 10% of market opportunities meet our criteria.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
