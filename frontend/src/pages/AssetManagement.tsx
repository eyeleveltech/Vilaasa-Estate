import { useState } from "react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AssetAuditDialog } from "@/components/AssetAuditDialog";
import { CDN_ASSETS } from "@/config/cdnAssets";

const focusPillars = [
  {
    icon: "trending_up",
    title: "Performance",
    tagline: "Alpha Generation",
    description:
      "Active oversight and tenant curation engineered to consistently outperform benchmark real estate indices.",
  },
  {
    icon: "tune",
    title: "Optimisation",
    tagline: "Yield Maximisation",
    description:
      "Transforming static, under-rented square footage into high-yield executive leases and premium serviced suites.",
  },
  {
    icon: "diamond",
    title: "Value Creation",
    tagline: "Capital Appreciation",
    description:
      "Strategic architectural, interior, and amenity upgrades that elevate property prestige and appraisal valuations.",
  },
  {
    icon: "all_inclusive",
    title: "Long-Term Growth",
    tagline: "Intergenerational Wealth",
    description:
      "Disciplined market cycle timing, risk mitigation, and seamless portfolio reinvestment across global prime hubs.",
  },
];

const capabilities = [
  {
    id: "01",
    icon: "analytics",
    title: "Asset Portfolio Assessment",
    subtitle: "In-Depth Diagnosis & Health Check",
    points: [
      "Current fair-market valuation & rental yield audit",
      "Deferred maintenance & space underutilisation review",
      "Benchmarking against micro-market luxury peer assets",
    ],
  },
  {
    id: "02",
    icon: "travel_explore",
    title: "Investment & Acquisition Advisory",
    subtitle: "Buy-Side Sourcing & Feasibility",
    points: [
      "Off-market luxury villas & prime penthouses scouting",
      "Cross-border transaction structuring (India & Dubai)",
      "Strict financial IRR modeling & downside risk sensitivity",
    ],
  },
  {
    id: "03",
    icon: "architecture",
    title: "Asset Strategy & Planning",
    subtitle: "Bespoke 3–5 Year Business Plans",
    points: [
      "Hold vs. Refurbish vs. Reposition decision matrices",
      "Target demographic & corporate tenant profiling",
      "Capital expenditure (CapEx) budgeting and ROI forecasting",
    ],
  },
  {
    id: "04",
    icon: "payments",
    title: "Income & Yield Optimisation",
    subtitle: "Cashflow Maximisation",
    points: [
      "Dynamic pricing models for luxury vacation leases",
      "Multi-year institutional & corporate lease placements",
      "Ancillary revenue creation from bespoke hospitality add-ons",
    ],
  },
  {
    id: "05",
    icon: "gavel",
    title: "Lease & Contract Management",
    subtitle: "Fiduciary Tenant Governance",
    points: [
      "Institutional-grade tenancy contracts & escalation clauses",
      "Stringent tenant background & credit verification",
      "Seamless renewals, deposit management & dispute resolution",
    ],
  },
  {
    id: "06",
    icon: "design_services",
    title: "Development & Redevelopment Advisory",
    subtitle: "Architectural & Interior Repositioning",
    points: [
      "Turnkey designer refurbishment for luxury appeal",
      "Amenity enhancements (infinity pools, smart home automation)",
      "Space repurposing to unlock unmonetised square footage",
    ],
  },
  {
    id: "07",
    icon: "account_balance",
    title: "Financial & Performance Management",
    subtitle: "Transparent Accounting & Reporting",
    points: [
      "Quarterly P&L statements & Net Operating Income (NOI) audits",
      "Real-time tracking of yields, expenses, and capital reserves",
      "Cross-border NRI tax efficiency and remittance guidance",
    ],
  },
  {
    id: "08",
    icon: "verified_user",
    title: "Risk & Compliance Oversight",
    subtitle: "Regulatory & Title Protection",
    points: [
      "RERA / Dubai Land Department compliance verification",
      "Municipal approvals, structural audits & comprehensive insurance",
      "Clear legal encumbrance checks and succession planning",
    ],
  },
  {
    id: "09",
    icon: "currency_exchange",
    title: "Exit Strategy",
    subtitle: "Peak Monetisation & Capital Recycling",
    points: [
      "Data-driven divestment timing at micro-market cyclical peaks",
      "Private treaty sales to ultra-high-net-worth buyers",
      "1031-style reinvestment roll-overs into fresh prime developments",
    ],
  },
];

const lifecycleSteps = [
  {
    step: "01",
    name: "Audit & Diagnostic",
    headline: "Uncovering Hidden Yield",
    desc: "We perform an exhaustive audit of your real estate holdings, identifying under-rented square footage, physical deficiencies, and capital appreciation potential.",
  },
  {
    step: "02",
    name: "Reposition & Upgrade",
    headline: "Creating Premium Appeal",
    desc: "Our interior architects and operational specialists upgrade the asset to ultra-luxury standards, establishing a clear value proposition for high-paying corporate and vacation tenants.",
  },
  {
    step: "03",
    name: "Turnkey Operations",
    headline: "Hands-Free Monthly Cashflow",
    desc: "From tenant vetting and lease drafting to rent collection and continuous maintenance, Vilaasa manages the day-to-day operations while remitting net profits directly to you.",
  },
  {
    step: "04",
    name: "Monetisation & Exit",
    headline: "Realising Maximum Capital Gain",
    desc: "When macroeconomic and local market indices reach their highest peak, we execute an advantageous private divestment and roll over capital into the next high-yield opportunity.",
  },
];

const AssetManagement = () => {
  const [auditOpen, setAuditOpen] = useState(false);

  return (
    <div className="overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <SEO
        title="Luxury Real Estate Asset Management | Vilaasa Estates"
        description="Strategic asset management solutions designed to enhance property performance, optimise returns, and unlock long-term value across India and Dubai."
        canonical="https://www.vilaasaestates.com/asset-management"
      />

      <Navbar />

      <main className="pt-20 md:pt-24">
        {/* ============================================================ */}
        {/* HERO SECTION WITH CINEMATIC BACKDROP */}
        {/* ============================================================ */}
        <section className="relative px-4 md:px-8 xl:px-12 py-20 md:py-28 border-b border-border/40 overflow-hidden min-h-[85vh] flex items-center">
          {/* High-End Architectural Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
              style={{ backgroundImage: `url(${CDN_ASSETS.hero.villa})` }}
            />
            {/* Multi-Layer Luxury Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/80 z-10" />
            <div className="absolute top-1/3 left-1/4 w-[600px] h-[350px] bg-primary/15 blur-[160px] pointer-events-none rounded-full z-10" />
          </div>

          <div className="w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Narrative & CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="uppercase tracking-[0.2em] text-[11px] font-bold">
                  Private Wealth Advisory &amp; Stewardship
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[-0.02em] leading-[1.1] text-foreground font-luxia">
                Maximising the Value of{" "}
                <span className="font-serif italic text-primary block mt-1">Every Asset</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal max-w-2xl">
                We provide strategic asset management solutions designed to enhance property
                performance, optimise returns, and unlock long-term value. From financial oversight and
                repositioning to turnkey leasing and peak monetisation, we take a holistic approach to
                your real estate wealth across India and Dubai.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => setAuditOpen(true)}
                  className="gap-2.5 px-7 py-6 text-xs uppercase tracking-widest font-semibold shadow-lg shadow-primary/10"
                >
                  <span className="material-symbols-outlined text-lg">assessment</span>
                  <span>Request Confidential Asset Audit</span>
                </Button>

                <a href="#capabilities">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-7 py-6 text-xs uppercase tracking-widest font-semibold border-border/80 hover:border-primary/50 bg-background/50 backdrop-blur-sm"
                  >
                    <span>Explore 9 Capabilities</span>
                  </Button>
                </a>
              </div>

              {/* Fiduciary Pillars Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/60 max-w-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base">verified_user</span>
                    <span>Fiduciary Standard</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Unbiased buy-side and management advisory protecting client capital.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base">public</span>
                    <span>India &amp; Dubai</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Cross-border operational oversight spanning key global luxury hubs.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base">lock</span>
                    <span>Strict Discretion</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Institutional confidentiality and bespoke non-disclosure protocols.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Private Asset Stewardship Mandate Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="rounded-2xl bg-card/85 backdrop-blur-xl border border-border/80 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Private Advisory Mandate
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-background/60 border border-border/60 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-base">analytics</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Asset Diagnostic &amp; Space Audit</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        Identifying under-monetised square footage and deferred maintenance across private holdings.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-background/60 border border-border/60 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-base">real_estate_agent</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Turnkey Lease &amp; Tenant Governance</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        High-net-worth tenant vetting, institutional lease drafting, and hands-free rent remittance.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-background/60 border border-border/60 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-base">currency_exchange</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Cyclical Divestment &amp; Reinvestment</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        Strategic peak-market exit advisory with seamless capital roll-overs into fresh assets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4 CORE FOCUS PILLARS */}
        {/* ============================================================ */}
        <section className="px-4 md:px-8 xl:px-12 py-16 md:py-24 bg-card/40 border-b border-border/40">
          <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold block mb-2">
                  Our Focus
                </span>
                <h2 className="text-3xl sm:text-4xl font-light text-foreground">
                  The Four Pillars of <span className="font-serif italic text-primary">Asset Stewardship</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
                Every property under our mandate is managed against rigorous quantitative metrics to
                protect capital while extracting maximum cashflow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {focusPillars.map((pillar, idx) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-7 rounded-xl bg-card/70 backdrop-blur-md border border-border/70 hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1 group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all">
                      <span className="material-symbols-outlined text-2xl">{pillar.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                      {pillar.tagline}
                    </span>
                    <h3 className="text-xl font-bold text-foreground mb-3">{pillar.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 9 CORE CAPABILITIES GRID */}
        {/* ============================================================ */}
        <section id="capabilities" className="px-4 md:px-8 xl:px-12 py-20 md:py-28 border-b border-border/40">
          <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold block mb-2">
                Full-Spectrum Advisory
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground">
                Nine Strategic <span className="font-serif italic text-primary">Capabilities</span>
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm mt-3 leading-relaxed">
                From initial acquisition due diligence to final cyclical divestment, our institutional
                advisory desk provides end-to-end asset mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((cap, idx) => (
                <motion.div
                  key={cap.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (idx % 3) * 0.1 }}
                  className="p-7 rounded-xl bg-card/70 backdrop-blur-md border border-border/80 hover:border-primary/50 transition-all hover:shadow-2xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                        <span className="material-symbols-outlined text-xl">{cap.icon}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-muted-foreground/60 tracking-wider">
                        {cap.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium mb-4">
                      {cap.subtitle}
                    </p>

                    <ul className="space-y-2.5 border-t border-border/40 pt-4">
                      {cap.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="material-symbols-outlined text-primary text-sm shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span className="leading-snug">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* HOW IT WORKS: 4-STEP ASSET LIFECYCLE */}
        {/* ============================================================ */}
        <section className="px-4 md:px-8 xl:px-12 py-20 md:py-28 bg-card/30 border-b border-border/40">
          <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto">
            <div className="max-w-xl mb-16">
              <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold block mb-2">
                Execution Model
              </span>
              <h2 className="text-3xl sm:text-4xl font-light text-foreground leading-tight">
                How We Manage Your Wealth: <br />
                <span className="font-serif italic text-primary">The 4-Stage Lifecycle</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {lifecycleSteps.map((item, idx) => (
                <div
                  key={item.step}
                  className="relative p-6 rounded-xl bg-card/80 border border-border/70 flex flex-col justify-between hover:border-primary/40 transition-colors"
                >
                  <div>
                    <span className="text-3xl font-serif italic text-primary/40 block mb-4">
                      {item.step}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold block mb-1">
                      {item.name}
                    </span>
                    <h3 className="text-base font-bold text-foreground mb-2">{item.headline}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  {idx < lifecycleSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-muted-foreground/40">
                      <span className="material-symbols-outlined text-xl">chevron_right</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CALL TO ACTION BANNER */}
        {/* ============================================================ */}
        <section className="px-4 md:px-8 xl:px-12 py-20 md:py-28 bg-gradient-to-b from-card to-background text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>Strict Fiduciary Confidentiality</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground leading-tight">
              Turn Your Idle Property Into A{" "}
              <span className="font-serif italic text-primary">High-Performing Asset</span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Schedule an executive consultation with our Private Asset Management team. Receive a
              complimentary yield gap analysis and repositioning roadmap.
            </p>

            <div className="pt-2">
              <Button
                size="lg"
                onClick={() => setAuditOpen(true)}
                className="gap-2 px-8 py-6 text-xs uppercase tracking-widest font-semibold shadow-lg shadow-primary/10"
              >
                <span className="material-symbols-outlined text-base">real_estate_agent</span>
                <span>Request Asset Portfolio Assessment</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Audit Request Dialog */}
      <AssetAuditDialog open={auditOpen} onOpenChange={setAuditOpen} />
    </div>
  );
};

export default AssetManagement;
