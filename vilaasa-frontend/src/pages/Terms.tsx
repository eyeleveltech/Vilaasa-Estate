import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiamondIcon } from "@/components/icons/DiamondIcon";

const Terms = () => {
  return (
    <div className="overflow-x-hidden bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <header className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0c1a14] to-background" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            <DiamondIcon className="w-12 h-12 text-gold-accent" />
            <h1 className="text-4xl md:text-6xl font-light text-foreground leading-[1.1] font-luxia">
              Terms of <span className="italic text-gold-accent">Service</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Last Updated: January 2025
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content Section */}
      <section className="py-16 md:py-24 px-4 md:px-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <div className="space-y-12">
              {/* Section 1 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using the Vilaasa Estate website, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  2. Role of Vilaasa Estate
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Vilaasa Estate acts as a Premium Aggregator and Consultant. We are not the developer, builder, or direct franchise operator. We act as a bridge between investors and third-party asset providers.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  3. Use of Services
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>You must be at least 18 years old to use this website.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>You agree to provide accurate and current information during registration or inquiry.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>"The Vault" login credentials must be kept confidential. You are responsible for all activities under your account.</span>
                  </li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  4. Intellectual Property
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  The content on this website, including the "Vilaasa Estate" logo, "The Luxury of Certainty" tagline, text, graphics, and UI design, is the property of N.J. Macson or its licensors and is protected by copyright laws. You may not reproduce or redistribute any content without express written permission.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  5. Limitation of Liability
                </h2>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex flex-col gap-2">
                    <span className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <strong className="text-foreground">No Guarantee:</strong>
                    </span>
                    <span className="ml-6">While we filter opportunities for quality, Vilaasa Estate does not guarantee the completion of construction projects, specific rental yields, or franchise business success.</span>
                  </li>
                  <li className="flex flex-col gap-2">
                    <span className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <strong className="text-foreground">Third-Party Actions:</strong>
                    </span>
                    <span className="ml-6">We are not liable for any breach of contract, delay, or failure by third-party developers, franchise brands, or service providers.</span>
                  </li>
                  <li className="flex flex-col gap-2">
                    <span className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <strong className="text-foreground">Investment Risk:</strong>
                    </span>
                    <span className="ml-6">Real estate and business investments carry inherent market risks. You engage in these investments at your own discretion.</span>
                  </li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  6. Governing Law
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of India / Courts of Chennai, without regard to its conflict of law provisions. Disputes arising in UAE operations may be subject to local UAE regulations where explicitly stated.
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
