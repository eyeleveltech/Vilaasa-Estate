import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { ShareButtons } from "@/components/ShareButtons";
import { CalanderDialog } from "@/components/CalanderDialog";
import { useState, useEffect } from "react";
import Gallery from "@/components/Gallery";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useProperty } from "@/hooks/useNewProperties";
import { useToast } from "@/hooks/use-toast";
import { InquiryFormDialog } from "@/components/InquiryFormDialog";
import { trackSilentPropertyView, isOtpVerified } from "@/lib/otpAccess";
import api from "@/api/axios";

const getStatusConfig = (rawStatus?: string) => {
  const s = (rawStatus || "AVAILABLE").toUpperCase().replace(/[\s-]+/g, "_");
  if (s.includes("AVAILABLE") || s.includes("SALE")) {
    return {
      label: "Available",
      dotColor: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
      badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    };
  }
  if (s.includes("READY")) {
    return {
      label: "Ready to Move",
      dotColor: "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]",
      badgeClass: "border-teal-500/40 bg-teal-500/10 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.15)]",
    };
  }
  if (s.includes("CONSTRUCTION") || s.includes("DEVELOPMENT")) {
    return {
      label: "Under Construction",
      dotColor: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
      badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    };
  }
  if (s.includes("OFF_PLAN") || s.includes("OFFPLAN")) {
    return {
      label: "Off-Plan",
      dotColor: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]",
      badgeClass: "border-sky-500/40 bg-sky-500/10 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.15)]",
    };
  }
  if (s.includes("RESERVE")) {
    return {
      label: "Reserved",
      dotColor: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]",
      badgeClass: "border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]",
    };
  }
  if (s.includes("SOLD") || s.includes("CLOSE")) {
    return {
      label: "Sold Out",
      dotColor: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
      badgeClass: "border-rose-500/40 bg-rose-500/10 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    };
  }
  return {
    label: rawStatus || "Available",
    dotColor: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  };
};

const PropertyDetail = () => {
  const navigate = useNavigate();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isOtpVerified());
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState<boolean>(() => !isOtpVerified());
  const [contactPartnerOpen, setContactPartnerOpen] = useState<boolean>(false);
  const [requested, setRequested] = useState<number[]>([]);
  const [costSheetModalOpen, setCostSheetModalOpen] = useState(false);
  const [selectedUnitIdx, setSelectedUnitIdx] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading, isError } = useProperty(id || "the-aurum");
  const { formatAmount, formatDynamicValue } = useCurrency();
  const { toast } = useToast();
  const configurations = property?.configurations ?? [];
  const hasArea = configurations.some((c) => Boolean(c.area && c.area.trim() && c.area !== "0 Sq.Ft."));
  const hasView = configurations.some((c) => Boolean(c.view && c.view.trim()));
  const hasPrice = configurations.some((c) => Boolean(c.price && Number(c.price) > 0));
  const statusInfo = getStatusConfig(property?.status);

  // 🚀 Silent View Tracking Effect for active 2-hour session
  useEffect(() => {
    if (isUnlocked && property?.id) {
      trackSilentPropertyView(property.id, property.name);
    }
  }, [isUnlocked, property?.id, property?.name]);

  // console.log(property);

  const handleRequest = (idx: number) => {
    if (requested.includes(idx)) return;
    setSelectedUnitIdx(idx);
    setCostSheetModalOpen(true);
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
    <div className="overflow-x-hidden bg-background pb-24 sm:pb-0">
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

              {property.tagline ? (
                <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                  {property.tagline}
                </p>
              ) : property.description && property.description[0] ? (
                <p className="max-w-2xl text-base text-muted-foreground md:text-lg line-clamp-2">
                  {property.description[0]}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-start gap-6 sm:gap-10">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Starting From
                  </span>
                  <div className="flex items-center h-8">
                    <span className="text-xl font-medium text-foreground sm:text-2xl leading-none">
                      {property.price && Number(property.price) > 0
                        ? formatDynamicValue(property.price)
                        : "Price on Application"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </span>
                  <div className="flex items-center h-8">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border ${statusInfo.badgeClass}`}
                    >
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>
                </div>

                <div className="w-full sm:ml-auto sm:w-auto self-end pt-1 flex items-center gap-2">
                  <Button
                    onClick={() => setContactPartnerOpen(true)}
                    variant="outline"
                    size="sm"
                    className="border-primary/40 text-foreground hover:bg-primary/10 hover:text-primary gap-1.5 text-xs font-semibold uppercase tracking-wider h-8 px-3"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">support_agent</span>
                    <span>Contact Senior Partner</span>
                  </Button>
                  <ShareButtons
                    title={`${property.name} - ${property.location}`}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Concept & Vision / Verdict Section */}
      {property.sectionVisibility?.["sec-vision"] !== false && (property.visionHeadline || (property.description && property.description.length > 0) || property.verdict?.quote) && (
        <section className="border-y border-border bg-card px-4 py-14 md:px-10 md:py-20">
          <div
            className={`mx-auto max-w-[1280px] ${
              property.verdict?.quote && (property.visionHeadline || (property.description && property.description.length > 0))
                ? "grid grid-cols-1 items-center gap-10 md:gap-16 lg:grid-cols-2"
                : property.verdict?.quote
                ? "max-w-2xl mx-auto"
                : "max-w-4xl mx-auto"
            }`}
          >
            {(property.visionHeadline || (property.description && property.description.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col gap-6"
              >
                <span className="text-primary/60 uppercase tracking-[0.2em] text-xs font-bold">
                  Concept & Vision
                </span>
                {property.visionHeadline && (
                  <h2 className="text-2xl font-light text-foreground sm:text-3xl md:text-4xl">
                    {property.visionHeadline}
                  </h2>
                )}
                {property.description && 
                  (property.tagline ? property.description : property.description.slice(1))
                    .map((para, idx) => (
                      <p
                        key={idx}
                        dangerouslySetInnerHTML={{ __html: para }}
                        className="text-sm leading-relaxed text-muted-foreground md:text-base whitespace-pre-line"
                      />
                ))}
              </motion.div>
            )}

            {property.verdict?.quote && (
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
                <p className="mb-4 text-base italic leading-relaxed text-foreground/90 md:text-lg">
                  &quot;{property.verdict.quote}&quot;
                </p>
                <div className="border-t border-border/50 pt-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground/90">
                    {property.verdict.author || "Vilaasa Advisory Board"}
                  </p>
                  {property.verdict.title && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {property.verdict.title}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* At a Glance */}
      {property.sectionVisibility?.["sec-specs"] !== false && (property.specs.length > 0 || property.brochure || property.virtualTour360Url) && (
        <section className="px-3.5 sm:px-6 md:px-10 py-10 sm:py-14 md:py-20">
          <div className="max-w-[1280px] mx-auto">
            {property.specs.length > 0 && (
              <>
                <h2 className="mb-6 text-xl sm:text-2xl font-light text-foreground md:mb-8">
                  At a Glance
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                  {property.specs.filter(s => s.label?.trim() && s.value?.trim()).map((spec, idx) => (
                    <motion.div
                      key={spec.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex flex-col gap-1.5 sm:gap-2 rounded border border-border bg-card p-3.5 sm:p-4 min-w-0"
                    >
                      <span className="text-muted-foreground text-[11px] sm:text-xs uppercase tracking-wider truncate">
                        {spec.label}
                      </span>
                      <span className="text-foreground font-medium text-sm sm:text-base break-words">
                        {formatDynamicValue(spec.value)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
            
            {(property.brochure || property.virtualTour360Url) && (
              <div className="mt-8 flex flex-wrap gap-4">
                {property.brochure && (
                  <a
                    href={property.brochure}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2 sm:w-auto">
                      <span className="material-symbols-outlined text-lg">
                        download
                      </span>
                      Download Brochure
                    </Button>
                  </a>
                )}
                {property.virtualTour360Url && (
                  <a
                    href={property.virtualTour360Url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2 sm:w-auto">
                      <span className="material-symbols-outlined text-lg">
                        view_in_ar
                      </span>
                      Virtual Tour 360
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Financial Intelligence */}
      {property.sectionVisibility?.["sec-financials"] !== false && property.financials.length > 0 && (
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
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
                    {formatDynamicValue(item.value)}
                  </p>
                  <p className="text-muted-foreground text-sm">{item.note}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Table */}
      {property.sectionVisibility?.["sec-pricing"] !== false && property.configurations.length > 0 && (
        <section className="px-4 py-14 md:px-10 md:py-20">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="mb-6 text-2xl font-light text-foreground md:mb-8">
              Pricing & Configurations
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full max-w-4xl border-collapse">
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

                    {hasView && (
                      <th className="py-4 px-4 text-muted-foreground text-sm font-medium">
                        View
                      </th>
                    )}

                    {hasPrice && (
                      <th className="py-4 px-4 text-muted-foreground text-sm font-medium">
                        Price
                      </th>
                    )}

                    <th className="py-4 px-4 text-muted-foreground text-sm font-medium text-right sm:text-left">
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
                        <td className="py-4 px-4 text-foreground font-medium whitespace-nowrap">
                          {config.type || "-"}
                        </td>

                        {hasArea && (
                          <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                            {config.area || "-"}
                          </td>
                        )}

                        {hasView && (
                          <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                            {config.view || "-"}
                          </td>
                        )}

                        {hasPrice && (
                          <td className="py-4 px-4 text-foreground whitespace-nowrap">
                            {config.price && Number(config.price) > 0
                              ? formatDynamicValue(config.price)
                              : "Price on Request"}
                          </td>
                        )}

                        <td className="py-4 px-4 text-right sm:text-left whitespace-nowrap">
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

      {/* Floor Plans / Gallery */}
      {property.sectionVisibility?.["sec-gallery"] !== false && property.galleryImages && <Gallery property={property} />}

      {/* Amenities */}
      {property.sectionVisibility?.["sec-amenities"] !== false && property.amenities.length > 0 && (
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

      {/* Location & Connectivity */}
      {property.sectionVisibility?.["sec-location"] !== false && (property.mapEmbedUrl || property.googleMapLink || (property.nearbyLocations && property.nearbyLocations.length > 0)) && (
        <section className="border-t border-border bg-card px-4 py-14 md:px-10 md:py-20">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="mb-2 text-2xl font-light text-foreground md:mb-3">
              Location &amp; Connectivity
            </h2>
            <p className="mb-8 text-xs text-muted-foreground uppercase tracking-wider">
              {property.location}
            </p>

            <div
              className={`grid grid-cols-1 gap-8 ${
                (property.mapEmbedUrl || property.googleMapLink) &&
                property.nearbyLocations &&
                property.nearbyLocations.length > 0
                  ? "lg:grid-cols-2"
                  : "lg:grid-cols-1 max-w-2xl"
              }`}
            >
              {/* Map Embed — only render if mapEmbedUrl / googleMapLink exists */}
              {(property.mapEmbedUrl || property.googleMapLink) && (
                <div className="overflow-hidden rounded-lg border border-border bg-secondary/20 aspect-[16/10] min-h-[300px] w-full min-w-0">
                  <iframe
                    src={(() => {
                      const url = property.mapEmbedUrl || property.googleMapLink || "";
                      if (url.includes("<iframe") && url.includes("src=")) {
                        const match = url.match(/src="([^"]+)"/);
                        if (match && match[1]) return match[1];
                      }
                      if (url.includes("/embed")) return url;
                      if (url.startsWith("http")) {
                        const query = encodeURIComponent(`${property.name}, ${property.location}`);
                        return `https://maps.google.com/maps?q=${query}&t=k&z=14&output=embed`;
                      }
                      return url;
                    })()}
                    title={`${property.name} Location`}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              {/* Nearby Places — only render if array has items */}
              {property.nearbyLocations && property.nearbyLocations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Proximity &amp; Commute
                  </h3>
                  {property.nearbyLocations.map((pl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-border/80 bg-background p-3.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{pl.name}</p>
                        {pl.description && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {pl.description}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-primary">{pl.distance}</p>
                        {pl.travelTime && (
                          <p className="text-[11px] text-muted-foreground">{pl.travelTime}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Footer CTA */}
      <div className="sticky bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md md:px-10 md:py-4">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <DiamondIcon className="w-8 h-10 text-gold-accent hidden sm:block" />
            <div>
              <p className="text-foreground font-medium">{property.name}</p>
              <p className="text-muted-foreground text-sm">
                {formatDynamicValue(property.price)}
              </p>
            </div>
          </div>
          <div className="flex w-full items-center gap-2.5 sm:w-auto">
            <Button
              onClick={() => setContactPartnerOpen(true)}
              variant="outline"
              className="flex-1 sm:flex-none border-primary/40 text-foreground hover:bg-primary/10 hover:text-primary gap-1.5 text-[10px] sm:text-sm font-semibold uppercase tracking-wider py-2 sm:py-2 px-2 sm:px-4"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-primary shrink-0">support_agent</span>
              <span className="truncate">Contact</span>
            </Button>
            <Button
              onClick={() => setOpenCalendar(true)}
              variant="hero"
              className="flex-1 sm:flex-none text-[10px] sm:text-sm font-bold uppercase tracking-wider py-2 sm:py-2 px-2 sm:px-4 truncate"
            >
              Book Inspection
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
              // 1. Submit directly to PostgreSQL backend (deliberate inquiry: sendEmail = true)
              await api.post("/inquiries", {
                name: savedLead?.name?.trim() || "VIP Client",
                email: savedLead?.email?.trim() || `vip-visit-${Date.now()}@client.com`,
                phone: fullPhone || "+971 50 0000000",
                investmentType: "real-estate",
                investmentRange: property.priceValue || "Ultra Prime",
                currency: "USD",
                source: "SITE_VISIT_MODAL",
                notes: `Private Inspection scheduled for ${date.toLocaleDateString()} at ${time}. Property: ${property.name}`,
                sendEmail: true,
                intent: "INQUIRY",
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
                title: "Private Inspection Scheduled",
                description: `Your private viewing for ${property.name} on ${date.toLocaleDateString()} at ${time} has been confirmed. Our Senior Partner will contact you shortly.`,
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

      {/* 🔐 Locked Dossier Gate if User lands directly on URL without verifying */}
      {!isUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-primary/30 bg-card/95 shadow-2xl">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary">
                lock
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-2">
                Confidential Portfolio Asset
              </span>
              <h2 className="text-2xl font-light text-foreground">
                {property.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Access to full architectural dossiers, floor plans, financial intelligence, and private viewings requires identity verification.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => setInquiryDialogOpen(true)}
                className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-3"
              >
                Unlock Private Dossier (OTP)
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Return to Portfolio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Dossier Dialog (View Only - No Email Sent) */}
      <InquiryFormDialog
        open={inquiryDialogOpen}
        onOpenChange={(open) => {
          setInquiryDialogOpen(open);
        }}
        projectType="real-estate"
        projectId={property.id}
        projectName={property.name}
        intent="unlock_view"
        customTitle={`View Details — ${property.name}`}
        customSubtitle={`Verify your mobile to access full architectural floor plans, high-res photography, and specifications for ${property.name}.`}

        onVerified={() => {
          setIsUnlocked(true);
          setInquiryDialogOpen(false);
        }}
      />

      {/* Contact Senior Partner Dialog (Deliberate Inquiry - Sends Email) */}
      <InquiryFormDialog
        open={contactPartnerOpen}
        onOpenChange={(open) => {
          setContactPartnerOpen(open);
        }}
        projectType="real-estate"
        projectId={property.id}
        projectName={property.name}
        intent="inquiry"
        customTitle={`Contact Senior Partner — ${property.name}`}
        customSubtitle={`Connect directly with our luxury advisory desk for bespoke guidance on ${property.name}.`}
        notes={`Direct inquiry to Senior Partner for ${property.name}`}
        onVerified={() => {
          setContactPartnerOpen(false);
        }}
      />

      {/* Cost Sheet Request Dialog (Deliberate Inquiry - Sends Email) */}
      <InquiryFormDialog
        open={costSheetModalOpen}
        onOpenChange={(open) => setCostSheetModalOpen(open)}
        projectType="real-estate"
        projectId={property.id}
        projectName={property.name}
        intent="inquiry"
        customTitle={`Request Cost Sheet — ${property.name}`}
        notes={
          selectedUnitIdx !== null && configurations[selectedUnitIdx]
            ? `Requested Cost Sheet for ${configurations[selectedUnitIdx].type}${
                configurations[selectedUnitIdx].area
                  ? ` (${configurations[selectedUnitIdx].area})`
                  : ""
              }`
            : undefined
        }
        onVerified={() => {
          if (selectedUnitIdx !== null) {
            setRequested((prev) => [...prev, selectedUnitIdx]);
          }
          setCostSheetModalOpen(false);
          setSelectedUnitIdx(null);
        }}
      />

      <Footer />
    </div>
  );
};

export default PropertyDetail;
