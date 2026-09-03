import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiamondIcon } from "@/components/icons/DiamondIcon";

const Privacy = () => {
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
              Privacy <span className="italic text-gold-accent">Policy</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Effective Date: January 2026
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
                  1. Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Vilaasa Estate ("we," "our," or "us"), a brand powered by N.J. Macson. We respect your privacy and are committed to protecting the personal data of our High Net Worth Individual (HNI) clients and partners. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or engage with our cross-border investment services.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  2. Information We Collect
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information to provide you with curated investment opportunities:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, nationality, residency status (NRI/Resident), and investment budget.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Investment Preferences:</strong> Interest in specific regions (India/UAE/Global), asset types (Real Estate/Franchise), and financial goals.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Technical Data:</strong> IP address, browser type, operating system, and browsing behavior via cookies to improve your "Gateway" and "Dashboard" experience.</span>
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  3. How We Use Your Information
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>To facilitate property acquisitions and franchise territory allocations.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>To connect you with specific developers or franchise brands (e.g., Colton) upon your request.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>To manage your "Vault" dashboard and document repository.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>To send you our market intelligence reports, "The Vilaasa Journal," and exclusive private listings.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>To comply with legal obligations (KYC/AML) in India and the UAE.</span>
                  </li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  4. Sharing of Information
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We function as a premium aggregator. We do not sell your data, but we may share it with:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Property Developers & Franchise Licensors:</strong> Only when you express specific interest in a project or brand.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Service Partners:</strong> Legal firms, concierge teams, or property management agencies to fulfill "White Glove" service requests.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Legal Authorities:</strong> If required by law in India or the UAE.</span>
                  </li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  5. International Data Transfers
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Since we operate globally, your information may be transferred to and maintained on servers located outside your state or country (e.g., between India and Dubai). By using our services, you consent to this transfer.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  6. Data Security
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use enterprise-grade security measures to protect your data within "The Vault" and our internal systems. However, no method of transmission over the Internet is 100% secure.
                </p>
              </div>

              {/* Section 7 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">
                  7. Contact Us
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  For privacy concerns, please contact our Compliance Officer at:
                </p>
                <div className="bg-card/50 border border-border rounded-lg p-6 mt-4">
                  <p className="text-foreground">Email: privacy@vilaasaestate.com</p>
                  <p className="text-muted-foreground mt-2">
                    43, 2nd Cross Street, 2nd Main Road, Navarathna Garden, Defence Colony, Ekkatuthangal, Chennai, Tamil Nadu 600032
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
