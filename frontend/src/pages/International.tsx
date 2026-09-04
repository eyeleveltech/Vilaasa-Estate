import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Link, useNavigate } from "react-router-dom";
import { useProperties } from "@/hooks/useNewProperties";
import { CDN_ASSETS } from "@/config/cdnAssets";
import { InquiryFormDialog } from "@/components/InquiryFormDialog";
import { isOtpVerified } from "@/lib/otpAccess";

const benefits = [
  {
    icon: "account_balance",
    title: "Dollar-Pegged Stability",
    desc: "With the AED pegged to the USD, your investment is shielded from currency volatility, offering a secure store of value akin to holding dollars.",
  },
  {
    icon: "percent",
    title: "Tax Efficiency",
    desc: "Benefit from zero property tax, zero capital gains tax, and zero income tax on rental yields. Maximize your net returns legally.",
  },
  {
    icon: "flight_takeoff",
    title: "Golden Visa Access",
    desc: "Strategic property acquisition opens the door to long-term residency for you and your family, unlocking global mobility.",
  },
];

const heroVideos = [
  "/internationalVideo/video_1.mp4",
  "/internationalVideo/video_2.mp4",
  "/internationalVideo/video_3.mp4",
  "/internationalVideo/video_4.mp4",
];
const International = () => {
  const { formatAmount } = useCurrency();
  const { data: properties = [], isLoading, isError } = useProperties();
  const [activeType, setActiveType] = useState<string | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const internaltional = properties.filter(
    (p) =>
      p.franchiseCategory === "International" &&
      p.type?.toLowerCase() !== "franchise" &&
      p.rawType !== "FRANCHISE",
  );

  const filteredProperties = internaltional.filter((p) => {
    if (activeType && p.type !== activeType) return false;
    return true;
  });

  const clearFilters = () => {
    setActiveType(null);
  };

  const navigate = useNavigate();
  const openInquiry = (property: { id: string; name: string }) => {
    if (isOtpVerified()) {
      navigate(`/property/${property.id}`);
      return;
    }
    setSelectedProperty(property);
    setInquiryOpen(true);
  };

  const handleInquiryOpenChange = (open: boolean) => {
    setInquiryOpen(open);
    if (!open) setSelectedProperty(null);
  };

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => {
        // autoplay might be blocked, ignore
      });
    }
  }, [currentVideoIndex]);

  const propertyTypes = useMemo(() => {
    return Array.from(new Set(internaltional.map((p) => p.type)));
  }, [internaltional]);

  return (
    <div className="overflow-x-hidden bg-background">
      <Navbar />

      {/* Hero Section */}
      <header className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background z-10" />
          {/* <img 
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80" 
            alt="Dubai Skyline"
            className="w-full h-full object-cover"
          /> */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          >
            <source src={heroVideos[currentVideoIndex]} type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-4 md:gap-6"
          >
            <span className="text-gold-accent text-xs font-bold uppercase tracking-[0.22em] md:text-sm md:tracking-[0.3em]">
              International Collection
            </span>
            <h1 className="font-luxia text-3xl font-light leading-[1.1] text-white sm:text-4xl md:text-6xl lg:text-7xl">
              Borders Are Not <br />
              <span className="italic text-gold-accent">Barriers.</span>
            </h1>
            <p className="max-w-xl px-2 text-base leading-relaxed text-white/70 md:px-0 md:text-xl">
              Dollar-denominated assets. World-class infrastructure.
              Tax-efficient returns.
            </p>
            <div className="mt-4 flex w-full flex-col gap-3 sm:mt-6 sm:w-auto sm:flex-row sm:gap-4">
              <a href="#property">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Explore Listings
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 sm:flex md:bottom-10">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="material-symbols-outlined">
              keyboard_arrow_down
            </span>
          </motion.div>
        </div>
      </header>

      {/* Collection Section */}
      <section className="bg-[#0c1a14] px-4 py-14 md:px-10 md:py-32">
        <div className="max-w-[1280px] mx-auto">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 mb-16"
          >
            <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
              Curated Portfolio
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-white">
              The Dubai{" "}
              <span className="font-serif italic text-gold-accent">
                Collection
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              We simplify the acquisition of premium UAE properties for the
              Indian investor. In a market defined by rapid growth and
              architectural marvels, discerning the exceptional from the merely
              expensive requires local intelligence.
            </p>
            <p className="text-muted-foreground/70 text-base max-w-2xl">
              Fully vetted for legal clarity and rental yield, our portfolio
              represents the pinnacle of desert modernism and waterfront luxury.
            </p>
          </motion.div> */}

          {/* Lifestyle Filters */}
          <div className="mb-5 flex flex-wrap items-center gap-2 md:gap-3">
            <span className="mr-0 w-full text-sm text-muted-foreground sm:mr-2 sm:w-auto">
              Explore by Lifestyle
            </span>
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(activeType === type ? null : type)}
                className={`rounded-sm px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] transition-all sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-wider ${
                  activeType === type
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {/* Clear Filters */}
          {activeType && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">close</span>
              Clear all filters
            </button>
          )}
          {/* Property Grid */}
          <section id="property" className="mt-5">
            <div className="max-w-[1280px] mx-auto">
              <div className="mb-6 flex items-center justify-between md:mb-8">
                <p className="text-sm text-muted-foreground md:text-base">
                  {isLoading
                    ? "Loading properties..."
                    : `Showing ${filteredProperties.length} properties`}
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground mt-4">
                    Loading properties from server...
                  </p>
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-5xl text-red-500/50">
                    error
                  </span>
                  <p className="text-muted-foreground mt-4">
                    Failed to load properties. Please make sure the backend
                    server is running.
                  </p>
                </div>
              )}

              {/* Properties Grid */}
              {!isLoading && !isError && (
                <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                  {filteredProperties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => openInquiry({ id: property.id, name: property.name })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openInquiry({ id: property.id, name: property.name });
                          }
                        }}
                        className="group block w-full cursor-pointer overflow-hidden rounded-sm border border-border bg-card text-left transition-all hover:border-primary/50 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <div
                            className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{
                              backgroundImage: `url(${property.image})`,
                            }}
                          />
                          <div className="absolute left-3 top-3 rounded bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                            {property.type}
                          </div>
                          {property.status && (
                            <div className="absolute right-3 top-3 rounded bg-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-foreground sm:right-4 sm:top-4 sm:px-3 sm:text-xs">
                              {property.status}
                            </div>
                          )}
                        </div>
                        <div className="p-4 sm:p-5 md:p-6">
                          <h3 className="text-lg font-light text-foreground transition-colors group-hover:text-primary sm:text-xl">
                            {property.name}
                          </h3>
                          <p className="mt-1 text-sm capitalize text-muted-foreground">
                            {property.location.replace("-", " ")}
                          </p>

                          {/* Features */}
                          {property.features && (
                            <div className="mt-3 space-y-1">
                              {property.features
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 text-xs text-foreground/70"
                                  >
                                    <span className="material-symbols-outlined text-primary text-xs">
                                      check_circle
                                    </span>
                                    {feature}
                                  </div>
                                ))}
                            </div>
                          )}

                          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 sm:gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                Price
                              </p>
                              <p className="text-base font-bold text-primary sm:text-lg">
                                {formatAmount(property.price)}
                              </p>
                            </div>
                            {(property.return || property.roi) && (
                              <>
                                <div className="h-8 w-px bg-border" />
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Returns
                                  </p>
                                  <p className="text-xs font-medium text-gold sm:text-sm">
                                    {property.return || property.roi}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="mt-4 w-full">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openInquiry({ id: property.id, name: property.name });
                              }}
                              className="inline-flex w-full justify-center bg-primary py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredProperties.length === 0 && !isLoading && !isError && (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-5xl text-muted-foreground/50">
                    search_off
                  </span>
                  <p className="text-muted-foreground mt-4">
                    No properties match your filters. Try adjusting your
                    selection.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <InquiryFormDialog
        key={selectedProperty?.id ?? "inquiry"}
        open={inquiryOpen}
        onOpenChange={handleInquiryOpenChange}
        projectType="real-estate"
        projectId={selectedProperty?.id}
        projectName={selectedProperty?.name}
        intent="unlock_view"
        customTitle={`View Details — ${selectedProperty?.name || "International Asset"}`}
        customSubtitle="Verify your mobile to view full photography, floor plans, and architectural specifications."
      />


      {/* Benefits Section */}
      <section className="border-t border-border/10 bg-background px-4 py-16 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col gap-4"
            >
              <span className="material-symbols-outlined text-4xl text-gold-accent">
                {benefit.icon}
              </span>
              <h3 className="text-xl font-medium text-foreground">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="border-y border-gold-accent/10 bg-[#0c1a14] px-4 py-14 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-gold-accent/50 text-xs uppercase tracking-widest mb-4 block">
            Our Standard
          </span>
          <p className="font-serif text-xl font-light italic text-white/90 md:text-3xl">
            "We reject 98% of available inventory to ensure only the highest
            performing assets reach you."
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-background px-4 py-16 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 md:gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
              The Process
            </span>
            <h2 className="mt-4 mb-5 text-3xl font-light text-foreground md:mb-6 md:text-5xl">
              Vetted for{" "}
              <span className="italic text-gold-accent">performance.</span>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
              Every international asset passes through our four-stage due
              diligence framework before being presented to investors.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Macro Market Analysis",
                desc: "We analyze regulatory stability, currency strength, tourism trends, and government policy in each target jurisdiction.",
              },
              {
                step: "02",
                title: "Developer & Asset Audit",
                desc: "Rigorous vetting of developer track record, escrow account compliance, construction milestones, and title clarity.",
              },
              {
                step: "03",
                title: "Yield & Exit Modeling",
                desc: "Conservative cash-flow projections incorporating all local fees, management costs, tax implications, and 5-10 year exit scenarios.",
              },
              {
                step: "04",
                title: "Structuring & Acquisition",
                desc: "End-to-end support with cross-border legal structures, remittance compliance (LRS/FDI), and international banking setup.",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 border-b border-border/10 pb-6"
              >
                <span className="font-mono text-xs font-bold text-gold-accent sm:text-sm">
                  {item.step}
                </span>
                <div>
                  <h4 className="font-medium text-foreground text-sm sm:text-base">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed sm:text-sm">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/10 bg-card px-4 py-16 text-center md:px-10 md:py-24">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <DiamondIcon className="text-gold-accent" />
          <h2 className="text-2xl font-light text-foreground md:text-4xl">
            Explore Global Opportunities
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Schedule a private consultation with our international advisory team to
            discuss your portfolio goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/calendar">
              <Button variant="hero" size="lg">
                Book Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default International;
