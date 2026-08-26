import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CDN_ASSETS } from "@/config/cdnAssets";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useFranchiseList } from "@/hooks/useNewFranchise";
import { InquiryFormDialog } from "@/components/InquiryFormDialog";
import { isOtpVerified } from "@/lib/otpAccess";

const DomesticFranchise = () => {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { formatAmount, formatDynamicValue } = useCurrency();
  // const { data: products = [], isLoading, isError } = useProperties();

  const { data: franchises = [], isLoading, isError } = useFranchiseList();

  const domesticFranchise = franchises.filter(
    (p) => p.category === "Franchises",
  );

  const filteredFranchises = domesticFranchise.filter((f) => {
    if (activeType && f.type !== activeType) return false;
    if (location && f.location !== location) return false;
    return true;
  });

  const franchiseTypes = useMemo(() => {
    return Array.from(new Set(filteredFranchises.map((p) => p.type)));
  }, [filteredFranchises]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground animate-pulse">
          Loading Franchise Opportunities...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-red-500">
          Failed to load opportunities. Please try again later.
        </div>
      </div>
    );
  }

  const clearFilters = () => {
    setActiveType(null);
    setLocation(null);
  };

  const openInquiry = (franchise: { id: string; name: string }) => {
    if (isOtpVerified()) {
      navigate(`/franchise/${franchise.id}`);
      return;
    }
    setSelectedFranchise(franchise);
    setInquiryOpen(true);
  };

  const handleInquiryOpenChange = (open: boolean) => {
    setInquiryOpen(open);
    if (!open) setSelectedFranchise(null);
  };

  return (
    <div className="overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="relative flex min-h-[56vh] w-full flex-col items-center justify-center overflow-hidden pt-20 md:min-h-[60vh] md:pt-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background z-10" />
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${CDN_ASSETS.franchise.wellnessKerala})` }}
          />
        </div>

        <div className="relative z-20 flex max-w-[1280px] flex-col items-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col items-center gap-3 md:gap-4"
          >
            <Link
              to="/domestic"
              className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-gold sm:text-sm"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              Back to Domestic
            </Link>

            <h1 className="max-w-4xl font-luxia text-3xl font-light italic leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl md:text-6xl lg:text-7xl">
              Franchise Opportunities
            </h1>

            <p className="max-w-xl px-2 text-base font-light leading-relaxed text-foreground/80 md:px-0 md:text-xl">
              Strategic business ownership with proven models
            </p>
          </motion.div>
        </div>
      </header>

      {/* Filters Section */}
      <section className="border-b border-border bg-card px-4 py-10 md:py-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Franchise Types */}
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground md:mb-4 md:tracking-[0.2em]">
                Franchise Category
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {franchiseTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setActiveType(activeType === type ? null : type)
                    }
                    className={`flex items-center gap-2 rounded-sm px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] transition-all sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-wider ${
                      activeType === type
                        ? "bg-gold text-gold-foreground"
                        : "border border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Locations */}
            {/* <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Location
              </h3>
              <div className="flex flex-wrap gap-3">
                {franchiseLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(location === loc ? null : loc)}
                    className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                      location === loc
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Clear Filters */}
            {activeType && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-gold transition-colors w-fit flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
                Clear filter
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Franchises Grid */}
      <section className="bg-background px-4 py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-6 flex items-center justify-between md:mb-8">
            <p className="text-sm text-muted-foreground md:text-base">
              Showing {filteredFranchises.length} opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {filteredFranchises.map((franchise, index) => (
              <motion.div
                key={franchise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group block w-full overflow-hidden rounded-sm border border-border bg-card text-left transition-all hover:border-gold/50">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${franchise.image})` }}
                    />
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 sm:left-4 sm:top-4">
                      <div className="rounded bg-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-foreground sm:px-3 sm:text-xs">
                        {franchise.type || "Franchise"}
                      </div>
                      {franchise.franchiseModel && (
                        <div className="rounded bg-emerald-600/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white border border-emerald-400/30">
                          {franchise.franchiseModel}
                        </div>
                      )}
                    </div>
                    {/* {franchise. === "Opening 2025" && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">
                        Coming Soon
                      </div>
                    )} */}
                  </div>
                  <div className="p-4 sm:p-5 md:p-6">
                    <h3 className="text-lg font-light text-foreground transition-colors group-hover:text-gold sm:text-xl">
                      {franchise.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {franchise.location}
                    </p>

                    {/* Features */}
                    <div className="mt-4 space-y-2">
                      {franchise.features.slice(0, 3).map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-foreground/70 sm:text-sm"
                        >
                          <span className="material-symbols-outlined text-primary text-sm">
                            check_circle
                          </span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 sm:gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Investment
                        </p>
                        <p className="text-base font-bold text-gold">
                          {`${formatDynamicValue(franchise.price || franchise.investment)}+`}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Expected ROI
                        </p>
                        <p className="text-xs font-bold text-primary sm:text-sm">
                          {franchise.expectedROI || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 w-full">
                      <button
                        type="button"
                        onClick={() => openInquiry({ id: franchise.id, name: franchise.name })}
                        className="inline-flex w-full justify-center bg-gold py-2 text-sm font-bold uppercase tracking-wider text-gold-foreground transition-colors hover:bg-gold/90"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredFranchises.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-muted-foreground/50">
                search_off
              </span>
              <p className="text-muted-foreground mt-4">
                No franchises match your filter. Try a different category.
              </p>
            </div>
          )}
        </div>
      </section>

      <InquiryFormDialog
        key={selectedFranchise?.id ?? "inquiry"}
        open={inquiryOpen}
        onOpenChange={handleInquiryOpenChange}
        projectType="franchise"
        projectId={selectedFranchise?.id}
        projectName={selectedFranchise?.name}
      />

      <Footer />
    </div>
  );
};

export default DomesticFranchise;
