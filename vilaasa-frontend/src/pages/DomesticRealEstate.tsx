import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CDN_ASSETS } from "@/config/cdnAssets";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useProperties } from "@/hooks/useNewProperties";

const DomesticRealEstate = () => {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const { formatAmount } = useCurrency();
  /* Removed hardcoded properties */
  const { data: properties = [], isLoading, isError } = useProperties();

  const domesticEstate = properties.filter(
    (p) => p.franchiseCategory === "Domestic",
  );

  const filteredProperties = domesticEstate.filter((p) => {
    if (activeType && p.type !== activeType) return false;

    if (activeLocation && p.location !== activeLocation) return false;
    return true;
  });

  const clearFilters = () => {
    setActiveType(null);
    setActiveLocation(null);
  };

  /* propertyTypes memo removed as it's no longer used for filtering */
  const propertyTypes = useMemo(() => {
    return Array.from(new Set(domesticEstate.map((p) => p.type)));
  }, [domesticEstate]);
  const propertyLocations = useMemo(() => {
    return Array.from(new Set(domesticEstate.map((p) => p.location)));
  }, [domesticEstate]);

  return (
    <div className="overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="relative flex min-h-[56vh] w-full flex-col items-center justify-center overflow-hidden pt-20 md:min-h-[60vh] md:pt-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background z-10" />
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${CDN_ASSETS.domestic.heritageVilla})` }}
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
              className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              Back to Domestic
            </Link>

            <h1 className="max-w-4xl font-luxia text-3xl font-light italic leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl md:text-6xl lg:text-7xl">
              Signature Real Estate
            </h1>

            <p className="max-w-xl px-2 text-base font-light leading-relaxed text-foreground/80 md:px-0 md:text-xl">
              Heritage homes & tier-1 assets across India
            </p>
          </motion.div>
        </div>
      </header>

      {/* Filters Section */}
      <section className="border-b border-border bg-card px-4 py-10 md:py-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Property Types Section */}

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground md:mb-4 md:tracking-[0.2em]">
                Property Type
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setActiveType(activeType === type ? null : type)
                    }
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
            </div>
            {/* Locations */}
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground md:mb-4 md:tracking-[0.2em]">
                Location
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {propertyLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() =>
                      setActiveLocation(activeLocation === loc ? null : loc)
                    }
                    className={`rounded-sm px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] transition-all sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-wider ${
                      activeLocation === loc
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(activeType || activeLocation) && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="bg-background px-4 py-12 md:py-16">
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
                Failed to load properties. Please make sure the backend server
                is running.
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={`/property/${property.id}`}
                    className="group block w-full overflow-hidden rounded-sm border border-border bg-card text-left transition-all hover:border-primary/50"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${property.image})` }}
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
                          {property.features.slice(0, 3).map((feature, idx) => (
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
                            {`${formatAmount(property.price)}${" "}Onwards`}
                          </p>
                        </div>
                        {property.roi && (
                          <>
                            <div className="h-8 w-px bg-border" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                Returns
                              </p>
                              <p className="text-xs font-medium text-gold sm:text-sm">
                                {property.return}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-4 w-full">
                        <span className="inline-flex w-full justify-center bg-primary py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors group-hover:bg-primary/90">
                          View Details
                        </span>
                      </div>
                    </div>
                  </Link>
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
                No properties match your filters. Try adjusting your selection.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DomesticRealEstate;
