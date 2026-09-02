import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ShareButtons";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useFranchise } from "@/hooks/useNewFranchise";
import { InquiryFormDialog } from "@/components/InquiryFormDialog";
import { trackSilentPropertyView, isOtpVerified } from "@/lib/otpAccess";
import api from "@/api/axios";
import { FranchisePageData, GalleryItem } from "@/admin/types/admin.types";
import { normalizeFranchisePageData } from "@/admin/lib/franchisePageHelpers";
import { Maximize2, Eye, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const FranchiseDetail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const { data: franchise, isLoading, isError } = useFranchise(id);
  const { formatAmount, formatDynamicValue } = useCurrency();
  const [selectedTier, setSelectedTier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isOtpVerified());
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState<boolean>(() => !isOtpVerified());
  const [pageContent, setPageContent] = useState<FranchisePageData | null>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!franchise?.id) return;
    api
      .get(`/franchise/${franchise.id}/page`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setPageContent(normalizeFranchisePageData(res.data.data));
        }
      })
      .catch(() => {});
  }, [franchise?.id]);

  useEffect(() => {
    if (isUnlocked && franchise?.id) {
      trackSilentPropertyView(franchise.id, franchise.name);
    }
  }, [isUnlocked, franchise?.id, franchise?.name]);

  const galleryImages: GalleryItem[] = pageContent?.galleryImages || [];

  const handlePrevImage = useCallback(() => {
    if (activeLightboxIndex === null || galleryImages.length === 0) return;
    setActiveLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1));
  }, [activeLightboxIndex, galleryImages.length]);

  const handleNextImage = useCallback(() => {
    if (activeLightboxIndex === null || galleryImages.length === 0) return;
    setActiveLightboxIndex((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0));
  }, [activeLightboxIndex, galleryImages.length]);

  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, handlePrevImage, handleNextImage]);

  useEffect(() => {
    if (activeLightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeLightboxIndex]);

  console.log("Franchise Data:", franchise);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading franchise details...</p>
        </div>
      </div>
    );
  }

  if (!franchise || isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light text-foreground mb-4">
            Franchise Not Found
          </h1>
          <Link to="/" className="text-primary hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleRequestAccess = async () => {
    if (!selectedTier) {
      toast({
        title: "Please select investment capacity",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast({
      title: "Access Requested",
      description:
        "Our team will send the Investment Memorandum within 24 hours.",
    });
    setIsSubmitting(false);
  };

  const supportCards =
    pageContent?.ecosystemCards?.length
      ? pageContent.ecosystemCards
          .filter((c) => c.title)
          .map((c) => ({
            name: c.title,
            description: c.description,
            icon: c.icon || "storefront",
          }))
      : pageContent?.support1Title
      ? [
          {
            name: pageContent.support1Title,
            description: pageContent.support1Description,
            icon: pageContent.support1Icon || "storefront",
          },
          {
            name: pageContent.support2Title,
            description: pageContent.support2Description,
            icon: pageContent.support2Icon || "design_services",
          },
          {
            name: pageContent.support3Title,
            description: pageContent.support3Description,
            icon: pageContent.support3Icon || "school",
          },
          {
            name: pageContent.support4Title,
            description: pageContent.support4Description,
            icon: pageContent.support4Icon || "campaign",
          },
        ].filter((c) => c.name)
      : franchise?.support_training || [];

  const benefitCards =
    pageContent?.benefitCards?.length
      ? pageContent.benefitCards
          .filter((b) => b.title)
          .map((b) => ({
            name: b.title,
            description: b.description,
            icon: b.icon || "volunteer_activism",
          }))
      : pageContent?.benefit1Title
      ? [
          {
            name: pageContent.benefit1Title,
            description: pageContent.benefit1Description,
            icon: pageContent.benefit1Icon || "volunteer_activism",
          },
          {
            name: pageContent.benefit2Title,
            description: pageContent.benefit2Description,
            icon: pageContent.benefit2Icon || "shield",
          },
          {
            name: pageContent.benefit3Title,
            description: pageContent.benefit3Description,
            icon: pageContent.benefit3Icon || "trending_up",
          },
        ].filter((b) => b.name)
      : franchise?.advantages || [];

  const heroImageSrc =
    pageContent?.heroImage ||
    pageContent?.galleryImages?.find((img) => img.isHero)?.url ||
    franchise.heroImage;

  return (
    <div className="overflow-x-hidden bg-background">
      <Navbar />

      {/* Hero Section */}
      <header className="relative min-h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          <img
            src={heroImageSrc}
            alt={franchise.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 w-full px-4 md:px-10 pb-16 pt-32">
          <div className="max-w-[1280px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="px-3 py-1 bg-gold/20 text-gold-accent text-xs rounded font-bold uppercase tracking-wider border border-gold/30">
                  {franchise.categoryEyebrow || franchise.type}
                </span>
                {franchise.brandOperatorName && franchise.brandOperatorName !== franchise.name && (
                  <span className="px-3 py-1 bg-secondary/80 text-foreground/80 border border-border text-xs rounded font-medium">
                    By {franchise.brandOperatorName}
                  </span>
                )}
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs rounded font-bold uppercase tracking-wider">
                  {franchise.franchiseModel || "FOCO"} Model
                </span>
                {franchise.projectCostRange && (
                  <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 text-xs rounded font-semibold">
                    Cost: {franchise.projectCostRange}
                  </span>
                )}
                {franchise.yieldPayoutFrequency && (
                  <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 text-xs rounded font-medium uppercase tracking-wider">
                    {franchise.yieldPayoutFrequency} Payouts
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-foreground font-luxia">
                {pageContent?.mainHeadline ? (
                  pageContent.mainHeadline
                ) : (
                  <>
                    {franchise.name.split(" ").slice(0, -1).join(" ")} <br />
                    <span className="italic text-gold-accent">
                      {franchise.name.split(" ").slice(-1)}
                    </span>
                  </>
                )}
              </h1>

              <div className="flex flex-col space-y-4 md:flex-row w-full justify-between">
                {(pageContent?.subheading || franchise.tagline) && (
                  <p className="text-muted-foreground text-lg max-w-2xl line-clamp-2">
                    {pageContent?.subheading || franchise.tagline}
                  </p>
                )}
                <ShareButtons title={`${franchise.name} - ${franchise.type}`} />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Stats Bar (Section 2: Hero Financial Metrics) */}
      <section className="py-8 px-4 md:px-10 bg-card border-y border-border">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {pageContent?.heroMetrics && pageContent.heroMetrics.length > 0 ? (
            pageContent.heroMetrics
              .filter((stat) => stat.label && stat.value)
              .map((stat, idx) => (
                <div key={stat.id || idx} className="text-center">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-foreground text-lg md:text-xl font-medium">
                    {formatDynamicValue(stat.value)}
                  </p>
                </div>
              ))
          ) : pageContent?.metric1Label ? (
            [
              { label: pageContent.metric1Label, value: pageContent.metric1Value },
              { label: pageContent.metric2Label, value: pageContent.metric2Value },
              { label: pageContent.metric3Label, value: pageContent.metric3Value },
              { label: pageContent.metric4Label, value: pageContent.metric4Value },
            ]
              .filter((stat) => stat.label && stat.value)
              .map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-foreground text-lg md:text-xl font-medium">
                    {formatDynamicValue(stat.value)}
                  </p>
                </div>
              ))
          ) : (
            franchise.spec.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-foreground text-lg md:text-xl font-medium">
                  {stat.value}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 md:px-10">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-1 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
              {franchise.visionEyebrow || "The Vision"}
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-foreground mt-4 mb-6">
              {pageContent?.visionHeadline ||
                franchise.visionHeadline ||
                "Elevating wellness into a professionally managed investment category."}
            </h2>

            {franchise.highlightQuote && (
              <div className="my-6 p-6 rounded-xl border border-primary/30 bg-primary/5 italic text-base md:text-lg text-foreground/90 font-serif leading-relaxed">
                &ldquo;{franchise.highlightQuote}&rdquo;
              </div>
            )}

            {pageContent?.visionDescription ? (
              <p className="text-muted-foreground leading-relaxed mb-4 text-base whitespace-pre-line">
                {pageContent.visionDescription}
              </p>
            ) : Array.isArray(franchise.description) ? (
              franchise.description.map((para, idx) => (
                <p
                  key={idx}
                  className="text-muted-foreground leading-relaxed mb-4 text-base"
                >
                  {para}
                </p>
              ))
            ) : franchise.description ? (
              <p className="text-muted-foreground leading-relaxed mb-4 text-base whitespace-pre-line">
                {franchise.description}
              </p>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Financial Blueprint */}
      <section className="py-20 px-4 md:px-10 bg-[#0c1a14]">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-gold-accent text-3xl">
              pie_chart
            </span>
            <h2 className="text-2xl font-light text-foreground">
              Financial Blueprint
            </h2>
          </div>

          {/* Flexible Return Headline & Terms if configured */}
          {(franchise.returnHeadline || franchise.returnTerms) && (
            <div className="mb-8 p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 max-w-3xl">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Target Return Framework</span>
              </div>
              {franchise.returnHeadline && (
                <h3 className="text-xl md:text-2xl font-light text-foreground font-luxia mb-2">
                  {franchise.returnHeadline}
                </h3>
              )}
              {franchise.returnTerms && (
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                  {franchise.returnTerms}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {pageContent?.blueprintMetrics?.length ? (
              pageContent.blueprintMetrics
                .filter((item) => item.label)
                .map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 sm:p-4 bg-background/50 rounded border border-border min-w-0"
                  >
                    <p className="text-muted-foreground text-[11px] sm:text-xs uppercase tracking-wider mb-1 truncate">
                      {item.label}
                    </p>
                    <p className="text-foreground text-base sm:text-lg font-medium break-words">
                      {formatDynamicValue(item.value)}
                    </p>
                  </div>
                ))
            ) : pageContent?.metric5Label ? (
              [
                { label: pageContent.metric5Label, value: pageContent.metric5Value },
                { label: pageContent.metric6Label, value: pageContent.metric6Value },
                { label: pageContent.metric7Label, value: pageContent.metric7Value },
                { label: pageContent.metric8Label, value: pageContent.metric8Value },
              ]
                .filter((item) => item.label)
                .map((item) => (
                  <div
                    key={item.label}
                    className="p-4 bg-background/50 rounded border border-border"
                  >
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-foreground text-lg font-medium">
                      {formatDynamicValue(item.value)}
                    </p>
                  </div>
                ))
            ) : (
              franchise.financial.map((item) => (
                <div
                  key={item.label}
                  className="p-4 bg-background/50 rounded border border-border"
                >
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                    {item.label}
                  </p>

                  <p className="text-foreground text-lg font-medium">
                    {Array.isArray(item.value)
                      ? item.value.map((v) => formatDynamicValue(v)).join(" - ")
                      : formatDynamicValue(item.value)}
                  </p>
                </div>
              ))
            )}
          </div>

          {franchise.financialDisclaimer && (
            <p className="text-[11px] text-muted-foreground/60 mt-6 italic">
              * {franchise.financialDisclaimer}
            </p>
          )}
        </div>
      </section>

      {/* Wealth Projector CTA */}
      <section className="py-20 px-4 md:px-10 bg-background border-y border-border">
        <div className="max-w-[900px] mx-auto text-center">
          <span className="text-primary/60 uppercase tracking-[0.2em] text-xs font-bold">
            Financial Planning
          </span>
          <h2 className="text-3xl md:text-4xl font-light text-foreground mt-4 mb-4">
            Project Your <span className="italic text-primary">Returns</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Use our sophisticated Wealth Projector to estimate your potential
            returns across different currencies and geographies. Compare with
            traditional investments and make informed decisions.
          </p>
          <Link to="/wealth-projector">
            <Button variant="hero" size="lg" className="gap-2">
              <span className="material-symbols-outlined">calculate</span>
              Open Wealth Projector
            </Button>
          </Link>
        </div>
      </section>

      {/* Support & Training Section */}
      <section className="py-20 px-4 md:px-10 bg-card">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
              {pageContent?.ecosystemSubheading || franchise.ecosystemEyebrow || "Comprehensive Ecosystem"}
            </span>
            <h2 className="text-3xl font-light text-foreground mt-4 mb-4">
              {pageContent?.ecosystemHeading || franchise.ecosystemHeading || "Support & Training"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {pageContent?.ecosystemDescription ||
                franchise.ecosystemIntro ||
                franchise.support_training_para?.[0] ||
                "Turnkey institutional development covering location scouting, biophilic architectural styling, therapist certification, and international marketing."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {supportCards.map((feature, idx: number) => (
              <motion.div
                key={feature.name || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 sm:p-6 bg-background rounded-lg border border-border min-w-0"
              >
                <span className="material-symbols-outlined text-3xl text-gold-accent mb-4 block">
                  {feature.icon || "storefront"}
                </span>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {feature.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits / FOCO Advantage */}
      <section className="py-20 px-4 md:px-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
              {pageContent?.benefitsSubheading || franchise.benefitsEyebrow || "The FOCO Advantage"}
            </span>
            <h2 className="text-3xl font-light text-foreground mt-4 mb-4">
              {franchise.benefitsHeading || "The FOCO Advantage"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {pageContent?.benefitsDescription ||
                franchise.benefitsIntro ||
                "Franchise Owned, Company Operated. A completely hands-off investment model designed for busy professionals."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefitCards.map((adv, idx: number) => (
              <motion.div
                key={adv.name || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-card rounded-lg border border-border hover:border-gold-accent/50 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-gold-accent mb-4 block">
                  {adv.icon || "verified_user"}
                </span>
                <h3 className="text-xl font-medium text-foreground mb-3">
                  {adv.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {adv.description}
                </p>
              </motion.div>
            ))}
          </div>

          {franchise.claimDisclaimer && (
            <div className="mt-10 text-center">
              <p className="text-[11px] text-muted-foreground/60 italic max-w-2xl mx-auto">
                * {franchise.claimDisclaimer}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Investor Documents & Memorandums (Separated from Visual Gallery) */}
      {franchise.investorDocuments && franchise.investorDocuments.length > 0 && (
        <section className="py-16 px-4 md:px-10 bg-secondary/20 border-y border-border">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
                  Investor Downloads
                </span>
                <h2 className="text-2xl md:text-3xl font-light text-foreground mt-2">
                  Dossiers &amp; Memorandums
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Access institutional pitch books, architectural floor plans, and operational SOP audits.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {franchise.investorDocuments.map((doc) => {
                const isGated = doc.access === "LEAD_GATED";
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col justify-between p-5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <span className="material-symbols-outlined text-xl">description</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider text-muted-foreground border-border bg-secondary/50">
                          {doc.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {doc.fileSize || "Verified PDF Document"}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {isGated ? (
                          <>
                            <span className="material-symbols-outlined text-xs text-amber-400">lock</span>
                            <span className="text-amber-400">Requires OTP</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-xs text-emerald-400">public</span>
                            <span className="text-emerald-400">Public Document</span>
                          </>
                        )}
                      </span>

                      {isGated && !isUnlocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setInquiryDialogOpen(true)}
                          className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <span className="material-symbols-outlined text-sm">lock_open</span>
                          <span>Unlock</span>
                        </Button>
                      ) : (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Next Steps / Dynamic Call to Action */}
      <section className="py-20 px-4 md:px-10 bg-card border-t border-border">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
              {pageContent?.nextStepsSubheading || "Next Steps"}
            </span>
            <h2 className="text-3xl font-light text-foreground mt-4">
              Secure Your Legacy
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {pageContent?.nextStepsDescription ||
                "We provide end-to-end support to ensure your franchise asset performs at the highest level from day one."}
            </p>
            <Link to={franchise.primaryCta?.link || "/calendar"}>
              <Button className="mt-10">
                {pageContent?.ctaButton2 || franchise.primaryCta?.text || "Book a call today"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bespoke Gallery & Architectural Layouts (Section 10) */}
      {galleryImages.length > 0 && (
        <section className="py-20 px-4 md:px-10 bg-background border-t border-border">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-12">
              <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
                Visual Showcase
              </span>
              <h2 className="text-3xl font-light text-foreground mt-4 mb-2 font-luxia">
                Gallery Images &amp; Layouts
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
                Master floor plans, architectural layouts, and experiential spaces.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {galleryImages.map((img: GalleryItem, idx: number) => (
                <div
                  key={img.id || idx}
                  onClick={() => setActiveLightboxIndex(idx)}
                  className="rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/60 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-black/40 relative">
                    <img
                      src={img.url}
                      alt={img.caption || `Gallery ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Hover Overlay with Full View Action */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxIndex(idx);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider border border-primary/50 hover:border-primary shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      >
                        <Maximize2 className="h-3.5 w-3.5 text-primary" />
                        <span>Full View</span>
                      </button>
                    </div>

                    {/* Expand Icon Badge in Top-Right */}
                    <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white/80 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Maximize2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                  {img.caption && (
                    <div className="p-4 border-t border-border/60 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {img.caption}
                      </p>
                      <span className="text-[11px] text-primary font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Eye className="h-3 w-3" />
                        View
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🖼️ Full View Gallery Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxIndex !== null && galleryImages[activeLightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-6 select-none"
            onClick={() => setActiveLightboxIndex(null)}
          >
            {/* Top Header Bar */}
            <div
              className="flex items-center justify-between w-full max-w-7xl mx-auto z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                  Visual Showcase
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {franchise.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono mr-2">
                  {activeLightboxIndex + 1} / {galleryImages.length}
                </span>

                <a
                  href={galleryImages[activeLightboxIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                  title="Open Original in New Tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setActiveLightboxIndex(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                  title="Close Full View (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Image Stage */}
            <div
              className="relative flex-1 flex items-center justify-center my-2 max-w-7xl mx-auto w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button */}
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 hover:border-primary transition-all shadow-2xl hover:scale-110"
                  title="Previous Image (Left Arrow)"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* High-Resolution Image */}
              <motion.div
                key={activeLightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="max-h-[75vh] max-w-[90vw] md:max-w-[80vw] flex items-center justify-center"
              >
                <img
                  src={galleryImages[activeLightboxIndex].url}
                  alt={galleryImages[activeLightboxIndex].caption || `Full View ${activeLightboxIndex + 1}`}
                  className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
                />
              </motion.div>

              {/* Next Button */}
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 hover:border-primary transition-all shadow-2xl hover:scale-110"
                  title="Next Image (Right Arrow)"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Bottom Caption & Thumbnail Bar */}
            <div
              className="w-full max-w-3xl mx-auto text-center space-y-3 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages[activeLightboxIndex].caption && (
                <div className="px-5 py-2.5 rounded-xl bg-card/80 border border-border/80 backdrop-blur-md inline-block max-w-full">
                  <p className="text-sm md:text-base font-medium text-foreground">
                    {galleryImages[activeLightboxIndex].caption}
                  </p>
                </div>
              )}

              {/* Thumbnail Strip for fast navigation */}
              {galleryImages.length > 1 && (
                <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                  {galleryImages.map((thumb: GalleryItem, tIdx: number) => (
                    <button
                      key={thumb.id || tIdx}
                      type="button"
                      onClick={() => setActiveLightboxIndex(tIdx)}
                      className={`h-12 w-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        tIdx === activeLightboxIndex
                          ? "border-primary scale-105 shadow-md"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={thumb.url}
                        alt={`Thumbnail ${tIdx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔐 Locked Franchise Gate if User lands directly on URL without verifying */}
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
                Confidential Franchise Model
              </span>
              <h2 className="text-2xl font-light text-foreground">
                {franchise.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Access to full operator financial models, quarterly yield payout schedules, and franchise dossiers requires identity verification.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => setInquiryDialogOpen(true)}
                className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-3"
              >
                Unlock Franchise Dossier (OTP)
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

      {/* Inquiry & Verification Dialog (Unlock Dossier - No Email Sent) */}
      <InquiryFormDialog
        open={inquiryDialogOpen}
        onOpenChange={(open) => {
          setInquiryDialogOpen(open);
        }}
        projectType="franchise"
        projectId={franchise.id}
        projectName={franchise.name}
        intent="unlock_view"
        customTitle={`View Details — ${franchise.name}`}
        customSubtitle={`Verify your mobile to access full operator financials, expansion models, and specifications for ${franchise.name}.`}

        onVerified={() => {
          setIsUnlocked(true);
          setInquiryDialogOpen(false);
        }}
      />

      <Footer />
    </div>
  );
};

export default FranchiseDetail;
