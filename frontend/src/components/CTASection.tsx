import { motion } from "framer-motion";
import { DiamondIcon } from "./icons/DiamondIcon";
import { Button } from "@/components/ui/button";
import marbleTexture from "@/assets/marble-texture.jpg";
import { Link, useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section
      className="relative py-32 px-4 flex flex-col items-center justify-center text-center overflow-hidden"
      id="contact"
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-fixed bg-cover bg-center"
        style={{
          backgroundImage: `url(${marbleTexture})`,
          filter: "brightness(0.3)",
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-2xl flex flex-col items-center gap-8"
      >
        <DiamondIcon className="text-5xl text-primary" />

        <h2 className="text-3xl md:text-5xl font-light text-foreground leading-tight">
          Ready to elevate your <br /> standard of living?
        </h2>

        <Link to="/calendar">
          <Button
            variant="hero"
            size="lg"
            className="mt-4 shadow-lg shadow-primary/20"
          >
            Begin Private Consultation
          </Button>
        </Link>
      </motion.div>
    </section>
  );
};
