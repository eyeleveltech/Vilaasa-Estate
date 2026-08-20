import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { ShareButtons } from "@/components/ShareButtons";
import { CalanderDialog } from "@/components/CalanderDialog";
import { useState } from "react";
import Gallery from "@/components/Gallery";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useProperty } from "@/hooks/useNewProperties";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";

const PropertyDetail = () => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [requested, setRequested] = useState<number[]>([]);
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading, isError } = useProperty(id || "the-aurum");
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  const configurations = property?.configurations ?? [];
  const hasArea = configurations.some((c) => Boolean(c.area));

  // console.log(property);

  const handleRequest = (idx: number) => {
    if (requested.includes(idx)) return;

    setRequested((prev) => [...prev, idx]);

    // your API / modal / logic here
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Error/Not found state
  if (isError || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-500/50">
            error
          </span>
          <h1 className="text-4xl font-light text-foreground mb-4">
            Property Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            Could not load property data. Please ensure the backend server is
            running.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden bg-background">
      <Navbar />

      {/* Hero Section */}
      <header className="relative flex min-h-[64vh] items-end overflow-hidden md:min-h-[70vh]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
          {property.heroVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={property.heroVideo} type="video/mp4" />
              <img
                src={property.heroImage}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </video>
          ) : (
            <img
              src={property.heroImage}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="relative z-20 w-full px-4 pb-12 pt-24 md:px-10 md:pb-16 md:pt-32">
          <div className="max-w-[1280px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3 sm:text-sm">
                <span>{property.location}</span>
                <span className="text-primary">&bull;</span>
                <span className="rounded bg-primary/10 px-2 py-1 text-[11px] text-primary sm:text-xs">
                  {property.type}
                </span>
              </div>

              <h1 className="text-3xl font-light text-foreground sm:text-4xl md:text-6xl">
                {property.name}
              </h1>

              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                {property.description[0]?.substring(0, 120)}...
              </p>

              <div className="mt-4 flex flex-wrap items-end gap-4 sm:gap-6">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">
                    Starting From
                  </span>
                  <span className="text-xl font-medium text-foreground sm:text-2xl">
                    {formatAmount(property.price)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">
                    Status
                  </span>
                  <span className="text-foreground">{property.status}</span>
                </div>
                <div className="w-full sm:ml-auto sm:w-auto">
                  <ShareButtons
                    title={`${property.name} - ${property.location}`}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Concept Section */}
      <section className="border-y border-border bg-card px-4 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 md:gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <span className="text-primary/60 uppercase tracking-[0.2em] text-xs font-bold">
              Concept & Vision
            </span>
            <h2 className="text-2xl font-light text-foreground sm:text-3xl md:text-4xl">
              {property.visionHeadline}
            </h2>
            {property.description.map((para, idx) => (
              <p
                key={idx}
                dangerouslySetInnerHTML={{ __html: para }}
                className="text-sm leading-relaxed text-muted-foreground md:text-base"
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-lg border border-primary/20 bg-background p-5 md:p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">
                verified
              </span>
              <span className="text-primary font-medium">
                The Vilaasa Verdict
              </span>
            </div>
            <p className="mb-6 text-base italic leading-relaxed text-foreground/90 md:text-lg">
              "{property.verdict.quote}"
            </p>
          </motion.div>
        </div>
      </section>

      {/* At a Glance */}
      {property.specs.length > 0 && (
        <section className="px-4 py-14 md:px-10 md:py-20">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="mb-6 text-2xl font-light text-foreground md:mb-8">
              At a Glance
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
              {property.specs.map((spec, idx) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col gap-2 rounded border border-border bg-card p-4"
                >
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">
                    {spec.label}
                  </span>
                  <span className="text-foreground font-medium">
                    {spec.label === "Min Investment" ? (
                      <span>{formatAmount(Number(spec.value))}</span>
                    ) : (
                      <span>{spec.value}</span>
                    )}
                  </span>
                </motion.div>
              ))}
            </div>
            {property.brochure && (
              <a
                href={property.brochure}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="mt-8 w-full gap-2 sm:w-auto">
                  <span className="material-symbols-outlined text-lg">
                    download
                  </span>
                  Download Brochure
                </Button>
              </a>
            )}
          </div>
        </section>
      )}

      {/* Financial Intelligence */}
      {property.financials.length > 0 && (
        <section className="bg-[#0c1a14] px-4 py-14 md:px-10 md:py-20">
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
                  Financial Intelligence
                </span>
                <h2 className="mt-2 text-2xl font-light text-foreground md:text-3xl">
                  Investment Analysis
                </h2>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  Based on Q3 2024 market data for prime luxury real estate.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="material-symbols-outlined text-lg">info</span>
                Data verified by Vilaasa
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              {property.financials.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg border border-border bg-background/50 p-5 md:p-6"
                >
                  <div className="flex items-center gap-2 text-gold-accent mb-4">
                    <span className="text-sm">{item.label}</span>
                    <span className="material-symbols-outlined text-lg">
                      {item.icon}
                    </span>
                  </div>
                  <p className="mb-2 text-2xl font-light text-foreground md:text-3xl">
                    {item.label === "Market Size by Year" ? (
                      <span>{formatAmount(Number(item.value))}</span>
                    ) : (
                      <span>{item.value}</span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm">{item.note}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Table */}
      {property.configurations.length > 0 && (
        <section className="px-4 py-14 md:px-10 md:py-20">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="mb-6 text-2xl font-light text-foreground md:mb-8">
              Pricing & Configurations
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-4 px-4 text-muted-foreground text-sm font-medium">
                      Unit Type
                    </th>

                    {hasArea && (
                      <th className="py-4 px-4 text-muted-foreground text-sm font-medium">
                        Area
                      </th>
                    )}

                    <th className="py-4 px-4 text-muted-foreground text-sm font-medium">
                      Price
                    </th>

                    <th className="py-4 px-4 text-muted-foreground text-sm font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {property.configurations?.map((config, idx) => {
                    const isRequested = requested.includes(idx);

                    return (
                      <tr
                        key={idx}
                        className="border-b border-border/50 hover:bg-card/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-foreground font-medium">
                          {config.type || "-"}
                        </td>

                        {hasArea && (
                          <td className="py-4 px-4 text-muted-foreground">
                            {config.area ? `${config.area}` : "-"}
                          </td>
                        )}

                        <td className="py-4 px-4 text-foreground">
                          {config.price ? formatAmount(config.price) : "-"}
                        </td>

                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="whitespace-nowrap text-primary"
                            onClick={() => handleRequest(idx)}
                            disabled={isRequested}
                          >
                            {isRequested
                              ? "Cost Sheet Requested"
                              : "Request Cost Sheet"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Floor Plans */}
      {property.galleryImages && <Gallery property={property} />}

      {/* Amenities */}
      {property.amenities.length > 0 && (
        <section className="px-4 py-14 md:px-10 md:py-20">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="mb-6 text-2xl font-light text-foreground md:mb-8">
              Amenities
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {property.amenities.map((amenity, idx) => (
                <motion.div
                  key={amenity.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 md:p-6"
                >
                  <span className="material-symbols-outlined text-3xl text-primary mb-4 block">
                    {amenity.icon}
                  </span>
                  <h3 className="text-foreground font-medium mb-2">
                    {amenity.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {amenity.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      <section className="border-y border-border bg-card px-4 py-14 md:px-10 md:py-20">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-6 flex items-center gap-2 md:mb-8">
            <span className="material-symbols-outlined text-primary">map</span>
            <h2 className="text-xl font-light text-foreground sm:text-2xl">
              Location & Connectivity
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {property.googleMapLink && (
              <div className="aspect-video rounded-lg border border-border bg-background lg:col-span-2">
                <iframe
                  title="Google Map"
                  src={property.googleMapLink}
                  className="w-full h-full border-0 object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
            <div className="flex flex-col gap-4">
              {property.nearbyLocations.map((loc) => (
                <div
                  key={loc.name}
                  className="flex items-center justify-between p-4 bg-background rounded border border-border"
                >
                  <span className="text-foreground">{loc.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {loc.distance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Footer CTA */}
      <div className="sticky bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md md:px-10 md:py-4">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <DiamondIcon className="w-8 h-10 text-gold-accent hidden sm:block" />
            <div>
              <p className="text-foreground font-medium">{property.name}</p>
              <p className="text-muted-foreground text-sm">
                {formatAmount(property.price)}
              </p>
            </div>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Button
              onClick={() => setOpenCalendar(true)}
              variant="hero"
              className="w-full sm:w-auto"
            >
              Book a site Visit
            </Button>
          </div>
        </div>
      </div>
      <CalanderDialog
        open={openCalendar}
        onOpenChange={setOpenCalendar}
        propertyName={property.name}
        onConfirm={({ date, time }) => {
          const LEAD_PROFILE_STORAGE_KEY = "vilaasa-lead-profile";
          const SITE_VISIT_WEBHOOK_URL =
            "https://automate.eyelevelstudio.in/webhook/site-visit";
          let savedLead: {
            name?: string;
            email?: string;
            phone?: string;
            phoneCountryCode?: string;
          } | null = null;

          if (typeof window !== "undefined") {
            try {
              const raw = localStorage.getItem(LEAD_PROFILE_STORAGE_KEY);
              savedLead = raw ? (JSON.parse(raw) as typeof savedLead) : null;
            } catch (error) {
              console.error("Failed to read saved lead profile:", error);
            }
          }

          const fullPhone =
            savedLead?.phone && savedLead?.phoneCountryCode
              ? `${savedLead.phoneCountryCode} ${savedLead.phone}`.trim()
              : savedLead?.phone?.trim() || "";

          const payload = {
            propertyId: property.id,
            propertyName: property.name,
            date: date.toISOString(),
            time,
            timezone: "Asia/Kolkata",
            visitType:
              property.country?.toLowerCase() === "india"
                ? "real-estate-india"
                : "real-estate-international",
            source: "property-detail-sticky-cta",
            name: savedLead?.name?.trim() || "",
            email: savedLead?.email?.trim() || "",
            phone: fullPhone,
          };

          void (async () => {
            try {
              // 1. Submit directly to PostgreSQL backend
              await api.post("/inquiries", {
                name: savedLead?.name?.trim() || "VIP Client",
                email: savedLead?.email?.trim() || `vip-visit-${Date.now()}@client.com`,
                phone: fullPhone || "+971 50 0000000",
                investmentType: "real-estate",
                investmentRange: property.priceValue || "Ultra Prime",
                currency: "USD",
                source: "SITE_VISIT_MODAL",
                notes: `Private Site Visit scheduled for ${date.toLocaleDateString()} at ${time}. Property: ${property.name}`,
              });

              // 2. Also forward to webhook if available
              try {
                await fetch(SITE_VISIT_WEBHOOK_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
              } catch {
                // Optional webhook fallback
              }

              toast({
                title: "Site Visit Scheduled",
                description: `Your private viewing for ${property.name} on ${date.toLocaleDateString()} has been received.`,
              });
            } catch (error) {
              console.error("Site visit booking failed:", error);
              toast({
                title: "Visit request failed",
                description: "Could not schedule your visit. Please try again.",
                variant: "destructive",
              });
            }
          })();
        }}
      />
      <Footer />
    </div>
  );
};

export default PropertyDetail;
