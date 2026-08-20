import { motion } from "framer-motion";

export const QuoteSection = () => {
  return (
    <section className="relative py-24 md:py-32 px-4 md:px-10 bg-background border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-[960px] mx-auto text-center flex flex-col items-center gap-8"
      >
        <div className="flex items-center gap-4 text-primary/60">
          <span className="h-px w-8 bg-current" />
          <span className="uppercase tracking-[0.2em] text-xs font-bold">
            The Vilaasa Standard
          </span>
          <span className="h-px w-8 bg-current" />
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight text-foreground">
          "Vilaasa Estate acts as the{" "}
          <span className="text-primary italic font-serif">guardian</span> of
          your legacy, curating a world where assets perform and lifestyle
          transcends."
        </h2>

        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl font-light">
          We bridge the gap between emotional real estate and rational franchise
          aggregation. Our dual-portfolio approach ensures that while you enjoy
          the art of living, your capital is hard at work.
        </p>
      </motion.div>
    </section>
  );
};
