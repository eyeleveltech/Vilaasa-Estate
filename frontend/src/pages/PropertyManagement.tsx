import { useState } from "react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AssetAuditDialog } from "@/components/AssetAuditDialog";

const services = [
  {
    id: "01",
    icon: "home_repair_service",
    title: "Property Operations",
    subtitle: "Day-to-day Management",
    points: [
      "End-to-end coordination of the day-to-day requirements of your property, ensuring smooth and efficient operations.",
    ],
  },
  {
    id: "02",
    icon: "group",
    title: "Tenant & Lease Management",
    subtitle: "Tenancy Lifecycle",
    points: [
      "From tenant coordination and documentation to lease renewals and ongoing communication, we help simplify the entire tenancy lifecycle.",
    ],
  },
  {
    id: "03",
    icon: "engineering",
    title: "Maintenance & Upkeep",
    subtitle: "Preventive & Repairs",
    points: [
      "Regular property inspections, preventive maintenance, repairs and vendor coordination to keep your property well-maintained.",
    ],
  },
  {
    id: "04",
    icon: "real_estate_agent",
    title: "Leasing & Occupancy",
    subtitle: "Tenant Sourcing",
    points: [
      "Strategic assistance in property marketing, tenant sourcing, leasing and occupancy management to reduce vacancy periods.",
    ],
  },
  {
    id: "05",
    icon: "payments",
    title: "Rent & Revenue Management",
    subtitle: "Financial Visibility",
    points: [
      "Support with rent collection coordination, payment tracking and revenue monitoring for better financial visibility.",
    ],
  },
  {
    id: "06",
    icon: "campaign",
    title: "Property Marketing",
    subtitle: "Professional Positioning",
    points: [
      "Professional positioning and marketing of residential and commercial properties for leasing, sale or other suitable opportunities.",
    ],
  },
  {
    id: "07",
    icon: "security",
    title: "Vacant Property Management",
    subtitle: "Security & Preservation",
    points: [
      "Regular inspections, security coordination, maintenance and upkeep of unoccupied properties to ensure they remain secure and well-preserved.",
    ],
  },
];

const pillars = [
  {
    icon: "visibility",
    title: "We Watch",
    description: "Regular oversight of your property and its day-to-day requirements.",
  },
  {
    icon: "manage_accounts",
    title: "We Manage",
    description: "Tenants, maintenance, vendors, leasing and operational coordination.",
  },
  {
    icon: "trending_up",
    title: "We Optimise",
    description: "Identifying opportunities to improve occupancy, efficiency and returns.",
  },
  {
    icon: "shield",
    title: "We Protect",
    description: "Keeping your asset maintained, secure and cared for.",
  },
  {
    icon: "diamond",
    title: "We Add Value",
    description: "A management approach designed around the long-term potential of your property.",
  },
];

const differenceSteps = [
  {
    step: "01",
    name: "Hands-On Care",
    headline: "Active Involvement",
    desc: "We stay involved, keeping your property well-managed, maintained and ready.",
  },
  {
    step: "02",
    name: "Smarter Oversight",
    headline: "Proactive Monitoring",
    desc: "Regular monitoring and timely action keep operations smooth and issues under control.",
  },
  {
    step: "03",
    name: "Better Occupancy",
    headline: "Productive Assets",
    desc: "From positioning to tenant coordination, we work towards keeping your property productive.",
  },
  {
    step: "04",
    name: "Value Beyond Maintenance",
    headline: "Overall Performance",
    desc: "Our focus goes beyond upkeep — we look at the property's overall performance and potential.",
  },
  {
    step: "05",
    name: "One Trusted Partner",
    headline: "Single Point of Coordination",
    desc: "A single point of coordination for the many moving parts of property ownership.",
  },
];

const PropertyManagement = () => {
  const [auditOpen, setAuditOpen] = useState(false);

  return (
    <div className="overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <SEO
        title="Property Management | Vilaasa Estates"
        description="Comprehensive property management solutions that help property owners manage, maintain and maximise the value of their real estate assets."
        canonical="https://www.vilaasaestates.com/property-management"
      />

      <Navbar />

      <main className="pt-20 md:pt-24">
        {/* ============================================================ */}
        {/* HERO SECTION WITH CINEMATIC BACKDROP */}
        {/* ============================================================ */}
        <section className="relative px-4 md:px-8 xl:px-12 py-20 md:py-28 border-b border-border/40 overflow-hidden min-h-[85vh] flex items-center">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/property-management-hero.jpg"
              alt="Property Management"
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60 z-10" />
          </div>

          <div className="w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Narrative & CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-8 space-y-6"
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="uppercase tracking-[0.2em] text-[11px] font-bold">
                  Property Management
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[-0.02em] leading-[1.1] text-foreground font-luxia">
                Professional Management. <br />
                <span className="font-serif italic text-primary block mt-1">Protected Assets. Better Returns.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal max-w-2xl">
                At Vilaasa Estates, we provide comprehensive property management solutions that help property owners manage, maintain and maximise the value of their real estate assets. From day-to-day operations and tenant coordination to maintenance, leasing and asset oversight, we take care of the details so property owners can enjoy a more seamless ownership experience.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => setAuditOpen(true)}
                  className="gap-2.5 px-7 py-6 text-xs uppercase tracking-widest font-semibold shadow-lg shadow-primary/10"
                >
                  <span className="material-symbols-outlined text-lg">home_work</span>
                  <span>Connect With Our Team</span>
                </Button>

                <a href="#services">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-7 py-6 text-xs uppercase tracking-widest font-semibold border-border/80 hover:border-primary/50 bg-background/50 backdrop-blur-sm"
                  >
                    <span>Explore Services</span>
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 7 CORE SERVICES GRID */}
        {/* ============================================================ */}
        <section id="services" className="px-4 md:px-8 xl:px-12 py-20 md:py-28 border-b border-border/40">
          <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold block mb-2">
                Our Services
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground">
                Our Property Management <span className="font-serif italic text-primary">Services</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv, idx) => (
                <motion.div
                  key={srv.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (idx % 3) * 0.1 }}
                  className="p-7 rounded-xl bg-card/70 backdrop-blur-md border border-border/80 hover:border-primary/50 transition-all hover:shadow-2xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                        <span className="material-symbols-outlined text-xl">{srv.icon}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-muted-foreground/60 tracking-wider">
                        {srv.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {srv.title}
                    </h3>

                    <ul className="space-y-2.5 border-t border-border/40 pt-4 mt-4">
                      {srv.points.map((pt, pIdx) => (
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
        {/* MORE THAN PROPERTY MANAGEMENT (PILLARS) */}
        {/* ============================================================ */}
        <section className="px-4 md:px-8 xl:px-12 py-16 md:py-24 bg-card/40 border-b border-border/40">
          <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold block mb-2">
                  More Than Property Management
                </span>
                <h2 className="text-3xl sm:text-4xl font-light text-foreground">
                  Beyond Management. <span className="font-serif italic text-primary">Building Property Value.</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {pillars.map((pillar, idx) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-7 rounded-xl bg-card/70 backdrop-blur-md border border-border/70 hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1 group flex flex-col justify-start"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all">
                    <span className="material-symbols-outlined text-2xl">{pillar.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{pillar.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* THE VILAASA DIFFERENCE */}
        {/* ============================================================ */}
        <section className="px-4 md:px-8 xl:px-12 py-20 md:py-28 bg-card/30 border-b border-border/40">
          <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto">
            <div className="max-w-xl mb-16">
              <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold block mb-2">
                The Vilaasa Difference
              </span>
              <h2 className="text-3xl sm:text-4xl font-light text-foreground leading-tight">
                Managing Properties. <br />
                <span className="font-serif italic text-primary">Maximising Potential.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {differenceSteps.map((item, idx) => (
                <div
                  key={item.step}
                  className="relative p-6 rounded-xl bg-card/80 border border-border/70 flex flex-col justify-start hover:border-primary/40 transition-colors"
                >
                  <span className="text-3xl font-serif italic text-primary/40 block mb-4">
                    {item.step}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold block mb-1">
                    {item.name}
                  </span>
                  <h3 className="text-base font-bold text-foreground mb-2">{item.headline}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground leading-tight">
              Manage Your Property With <span className="font-serif italic text-primary">Confidence</span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Whether you own a residential, commercial, industrial or mixed-use property, Vilaasa Estates provides tailored property management solutions designed around your asset and objectives.
            </p>

            <div className="pt-2">
              <Button
                size="lg"
                onClick={() => setAuditOpen(true)}
                className="gap-2 px-8 py-6 text-xs uppercase tracking-widest font-semibold shadow-lg shadow-primary/10"
              >
                <span className="material-symbols-outlined text-base">real_estate_agent</span>
                <span>Contact Us Today</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Reusing Audit Dialog or replace with Contact form later */}
      <AssetAuditDialog open={auditOpen} onOpenChange={setAuditOpen} />
    </div>
  );
};

export default PropertyManagement;
