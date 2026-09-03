import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiamondIcon } from "@/components/icons/DiamondIcon";

const Disclaimer = () => {
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
              <span className="italic text-gold-accent">Disclaimer</span>
            </h1>
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
                  1. No Financial Advice
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  The information provided on this website, including "The Wealth Projector" calculator, ROI estimates, and "Market Intelligence" reports, is for informational purposes only. It does not constitute financial, legal, or tax advice. You should consult with your own certified financial advisor, accountant, or legal counsel before making any investment decision.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  2. Accuracy of Information
                </h2>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex flex-col gap-2">
                    <span className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <strong className="text-foreground">Pricing:</strong>
                    </span>
                    <span className="ml-6">Prices for properties and franchise licenses are subject to change without notice. Currency conversions (INR/USD/AED) are for reference only and may vary based on daily exchange rates.</span>
                  </li>
                  <li className="flex flex-col gap-2">
                    <span className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <strong className="text-foreground">Visuals:</strong>
                    </span>
                    <span className="ml-6">All images, renders, and walkthroughs are artistic impressions and may not represent the final delivered product.</span>
                  </li>
                  <li className="flex flex-col gap-2">
                    <span className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <strong className="text-foreground">Availability:</strong>
                    </span>
                    <span className="ml-6">Listings are subject to availability and may be sold or withdrawn by the developer at any time.</span>
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  3. Future Projections
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Statements regarding "Projected Yield," "Capital Appreciation," or "Expected Occupancy" are forward-looking estimates based on current market trends. Past performance is not a guarantee of future results. Actual returns may vary due to market fluctuations, economic conditions, and changes in government regulations.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  4. Franchise Disclaimer
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Investing in a franchise (e.g., Colton) involves risk. The success of the franchise depends on the operator's business acumen, location, and market conditions. Vilaasa Estate facilitates the connection but does not guarantee the profitability of any specific franchise unit.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  5. Third-Party Links
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website may contain links to third-party websites (e.g., Developer portals). We do not control or endorse the content of these sites and are not responsible for their practices.
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

export default Disclaimer;
