import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ShareButtons";
import { useToast } from "@/hooks/use-toast";
import Gallery from "@/components/Gallery";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useFranchise } from "@/hooks/useNewFranchise";
import { InquiryFormDialog } from "@/components/InquiryFormDialog";
import { trackSilentPropertyView, isOtpVerified } from "@/lib/otpAccess";

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

  useEffect(() => {
    if (isUnlocked && franchise?.id) {
      trackSilentPropertyView(franchise.id, franchise.name);
    }
  }, [isUnlocked, franchise?.id, franchise?.name]);

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

  return (
    <div className="overflow-x-hidden bg-background">
      <Navbar />

      {/* Hero Section */}
      <header className="relative min-h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          <img
            src={franchise.heroImage}
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
                <span className="px-3 py-1 bg-gold/20 text-gold-accent text-xs rounded font-bold uppercase tracking-wider">
                  {franchise.type}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs rounded font-bold uppercase tracking-wider">
                  {franchise.franchiseModel || "FOCO"} Model
                </span>
                {franchise.yieldPayoutFrequency && (
                  <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 text-xs rounded font-medium uppercase tracking-wider">
                    {franchise.yieldPayoutFrequency} Payouts
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-foreground font-luxia">
                {franchise.name.split(" ").slice(0, -1).join(" ")} <br />
                <span className="italic text-gold-accent">
                  {franchise.name.split(" ").slice(-1)}
                </span>
              </h1>

              <div className="flex flex-col space-y-4 md:flex-row w-full justify-between">
                <p className="text-muted-foreground text-lg max-w-2xl line-clamp-2">
                  {Array.isArray(franchise.description)
                    ? franchise.description.join(" ")
                    : franchise.description}
                </p>
                <ShareButtons title={`${franchise.name} - ${franchise.type}`} />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="py-8 px-4 md:px-10 bg-card border-y border-border">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {franchise.spec.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-foreground text-lg md:text-xl font-medium">
                {formatDynamicValue(stat.value)}
              </p>
            </div>
          ))}
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
              The Vision
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-foreground mt-4 mb-8">
              {franchise.visionHeadline ? (
                franchise.visionHeadline
              ) : (
                <>
                  Where culinary artistry meets{" "}
                  <span className="italic text-gold-accent">
                    intelligent capital.
                  </span>
                </>
              )}
            </h2>
            {franchise.description.map((para, idx) => (
              <p
                key={idx}
                className="text-muted-foreground leading-relaxed mb-4"
              >
                {para}
              </p>
            ))}
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <p className="text-3xl font-light text-gold-accent">
                {franchise.location.length}
              </p>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mt-2">
                Live Locations
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <p className="text-3xl font-light text-gold-accent">12k+</p>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mt-2">
                Monthly Footfall
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <p className="text-3xl font-light text-gold-accent">4.8</p>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mt-2">
                Avg Rating
              </p>
            </div>
          </motion.div> */}
        </div>
      </section>

      {/* Financial Blueprint */}
      <section className="py-20 px-4 md:px-10 bg-[#0c1a14]">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-gold-accent text-3xl">
              pie_chart
            </span>
            <h2 className="text-2xl font-light text-foreground">
              Financial Blueprint
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {franchise.financial.map((item) => (
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
            ))}
          </div>
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

      {/* Support & Training Section (for franchises with supportFeatures) */}
      {franchise.support_training_para && (
        <section className="py-20 px-4 md:px-10 bg-card">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-12">
              <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
                Comprehensive Ecosystem
              </span>
              <h2 className="text-3xl font-light text-foreground mt-4 mb-4">
                Support & Training
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {franchise.support_training_para}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {franchise.support_training?.map((feature, idx) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-background rounded-lg border border-border"
                >
                  <span className="material-symbols-outlined text-3xl text-gold-accent mb-4 block">
                    {feature.icon}
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
      )}

      {/* FOCO Advantage */}
      <section className="py-20 px-4 md:px-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
              Key Benefits
            </span>
            <h2 className="text-3xl font-light text-foreground mt-4 mb-4">
              The FOCO Advantage
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Franchise Owned, Company Operated. A completely hands-off
              investment model designed for busy professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {franchise.advantages?.map((adv, idx) => (
              <motion.div
                key={adv.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-card rounded-lg border border-border hover:border-gold-accent/50 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-gold-accent mb-4 block">
                  {adv.icon}
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
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20 px-4 md:px-10 bg-card border-t border-border">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold-accent/60 uppercase tracking-[0.2em] text-xs font-bold">
              Next Steps
            </span>
            <h2 className="text-3xl font-light text-foreground mt-4">
              Secure Your Legacy
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide end-to-end support to ensure your franchise asset
              performs at the highest level from day one.
            </p>
            <Link to="/calendar">
              <Button className="mt-10">Book a call today</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery  */}
      <Gallery property={franchise} />

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

      {/* Inquiry & Verification Dialog */}
      <InquiryFormDialog
        open={inquiryDialogOpen}
        onOpenChange={(open) => {
          setInquiryDialogOpen(open);
        }}
        projectType="franchise"
        projectId={franchise.id}
        projectName={franchise.name}
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
