import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AssetAuditDialog } from "@/components/AssetAuditDialog";

export const AssetManagementSection = () => {
  const [auditOpen, setAuditOpen] = useState(false);

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 xl:px-12 bg-[hsl(150_25%_5%)] border-y border-border/60 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left Column: Narrative & CTA */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 space-y-6"
        >
          <div className="flex items-center gap-2.5 text-primary text-[11px] font-bold uppercase tracking-[0.25em]">
            <span className="h-px w-5 bg-current" />
            <span>Wealth Stewardship</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground leading-[1.15]">
            Asset Management: <br />
            <span className="font-serif italic text-primary">Maximising Value</span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            We provide strategic asset management solutions designed to enhance property
            performance, optimise returns, and unlock long-term value. From financial oversight and
            repositioning to turnkey leasing and peak monetisation, we take a holistic approach to
            your real estate wealth.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {["Performance", "Optimisation", "Value Creation", "Long-Term Growth"].map(
              (tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-[11px] font-semibold tracking-wider rounded-full bg-secondary/60 text-foreground/80 border border-border"
                >
                  {tag}
                </span>
              ),
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/asset-management">
              <Button className="gap-2 px-6 py-5 text-xs uppercase tracking-widest font-semibold">
                <span>View Full Framework</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setAuditOpen(true)}
              className="gap-2 px-6 py-5 text-xs uppercase tracking-widest font-semibold border-border hover:border-primary/50"
            >
              <span className="material-symbols-outlined text-base">assessment</span>
              <span>Request Asset Audit</span>
            </Button>
          </div>
        </motion.div>

        {/* Right Column: 3 Pillar Feature Cards */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 grid grid-cols-1 gap-4"
        >
          <div className="p-5 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-xl">analytics</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                Portfolio Assessment &amp; Diagnosis
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Comprehensive evaluation of current rental yield, fair-market valuation, and
                underutilized square footage.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-xl">tune</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                Repositioning &amp; Yield Optimisation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Luxury interior upgrades and institutional lease structures that push yields from
                3% to 8–10%+.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-xl">currency_exchange</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                Peak Exit Strategy &amp; Reinvestment
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Divestment timing aligned with market highs, followed by seamless capital roll-overs
                into fresh prime assets.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <AssetAuditDialog open={auditOpen} onOpenChange={setAuditOpen} />
    </section>
  );
};
