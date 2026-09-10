import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountryCodeSelect } from "./CountryCodeSelect";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";

interface AssetAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const propertyTypes = [
  "Ultra-Luxury Villa",
  "Sky Penthouse",
  "Prime Residential Apartment",
  "Commercial / Retail Space",
  "Heritage / Holiday Estate",
  "Commercial Franchise Asset",
  "Multiple Portfolio Properties",
];

const valueRanges = [
  "₹5 Cr – ₹10 Cr ($600K – $1.2M)",
  "₹10 Cr – ₹25 Cr ($1.2M – $3M)",
  "₹25 Cr – ₹50 Cr ($3M – $6M)",
  "₹50 Cr+ ($6M+)",
];

const assetStatuses = [
  "Currently Vacant / Idle",
  "Self-Occupied (Occasional / Vacation)",
  "Under-Rented (Low Yields)",
  "Under Construction / Near Handover",
  "Looking to Divest / Sell at Peak",
];

const primaryGoals = [
  "Yield & Rental Optimisation (Maximum Cashflow)",
  "Interior Repositioning & Luxury Upgrades",
  "Turnkey Tenant & Lease Management",
  "Strategic Exit & Divestment Advisory",
  "Holistic Portfolio Assessment",
];

export const AssetAuditDialog = ({ open, onOpenChange }: AssetAuditDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    city: "",
    propertyType: "",
    approxValue: "",
    currentStatus: "",
    primaryGoal: "",
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    notes: "",
  });

  const resetForm = () => {
    setStep("form");
    setFormData({
      city: "",
      propertyType: "",
      approxValue: "",
      currentStatus: "",
      primaryGoal: "",
      name: "",
      email: "",
      phone: "",
      phoneCountryCode: "+91",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.city.trim() || !formData.propertyType || !formData.approxValue) {
      toast({
        title: "Asset details required",
        description: "Please specify your property city, category, and estimated valuation.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast({
        title: "Contact information required",
        description: "Please provide your full name, phone number, and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const consolidatedNotes = [
        `Asset Location: ${formData.city.trim()}`,
        `Property Type: ${formData.propertyType}`,
        `Current Status: ${formData.currentStatus || "Not specified"}`,
        `Primary Objective: ${formData.primaryGoal || "Portfolio Assessment"}`,
        formData.notes?.trim() ? `Client Notes: ${formData.notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await api.post("/inquiries", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: `${formData.phoneCountryCode}${formData.phone.trim()}`,
        investmentType: "asset-management",
        investmentRange: formData.approxValue,
        currency: "INR",
        source: "HERO_INQUIRY",
        notes: consolidatedNotes,
      });

      if (res.data.success) {
        setStep("success");
      } else {
        toast({
          title: "Submission failed",
          description: res.data.message || "Failed to register your asset audit request.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Could not submit audit request. Please try again or contact concierge.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) resetForm();
      }}
    >
      <DialogContent className="max-w-[620px] p-0 overflow-hidden border-border bg-card text-foreground max-h-[92vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 pb-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
            <span className="h-px w-4 bg-current" />
            <span>Private Wealth Advisory</span>
          </div>
          <DialogTitle className="text-xl md:text-2xl font-light text-foreground">
            Confidential <span className="font-serif italic text-primary">Asset Audit</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Submit your luxury property details for a strategic yield assessment and repositioning roadmap.
          </DialogDescription>
        </div>

        <div className="p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.form
                key="single-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* SECTION 1: Asset Portfolio Profile */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                    <span className="material-symbols-outlined text-sm text-primary">real_estate_agent</span>
                    <span className="text-[11px] uppercase tracking-widest font-bold text-foreground">
                      1. Property &amp; Portfolio Profile
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Property Location *
                      </Label>
                      <Input
                        placeholder="e.g. Palm Jumeirah, Dubai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="mt-1 h-9 bg-background border-border text-xs"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Property Category *
                      </Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(val) => setFormData({ ...formData, propertyType: val })}
                      >
                        <SelectTrigger className="mt-1 h-9 bg-background border-border text-xs">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-xs">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Estimated Valuation *
                      </Label>
                      <Select
                        value={formData.approxValue}
                        onValueChange={(val) => setFormData({ ...formData, approxValue: val })}
                      >
                        <SelectTrigger className="mt-1 h-9 bg-background border-border text-xs">
                          <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent>
                          {valueRanges.map((range) => (
                            <SelectItem key={range} value={range} className="text-xs">
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Current Occupancy
                      </Label>
                      <Select
                        value={formData.currentStatus}
                        onValueChange={(val) => setFormData({ ...formData, currentStatus: val })}
                      >
                        <SelectTrigger className="mt-1 h-9 bg-background border-border text-xs">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {assetStatuses.map((st) => (
                            <SelectItem key={st} value={st} className="text-xs">
                              {st}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Primary Objective
                    </Label>
                    <Select
                      value={formData.primaryGoal}
                      onValueChange={(val) => setFormData({ ...formData, primaryGoal: val })}
                    >
                      <SelectTrigger className="mt-1 h-9 bg-background border-border text-xs">
                        <SelectValue placeholder="Select Primary Goal (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {primaryGoals.map((goal) => (
                          <SelectItem key={goal} value={goal} className="text-xs">
                            {goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* SECTION 2: Owner Contact & Verification */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                    <span className="material-symbols-outlined text-sm text-primary">person</span>
                    <span className="text-[11px] uppercase tracking-widest font-bold text-foreground">
                      2. Owner &amp; Executive Verification
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Full Legal Name *
                      </Label>
                      <Input
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 h-9 bg-background border-border text-xs"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Email Address *
                      </Label>
                      <Input
                        type="email"
                        placeholder="name@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 h-9 bg-background border-border text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Phone Number *
                      </Label>
                      <div className="flex gap-1.5 mt-1">
                        <CountryCodeSelect
                          value={formData.phoneCountryCode}
                          onChange={(code) => setFormData({ ...formData, phoneCountryCode: code })}
                        />
                        <Input
                          type="tel"
                          placeholder="Mobile number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-background border-border flex-1 h-9 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Specific Notes (Optional)
                      </Label>
                      <Input
                        placeholder="e.g. 4BHK conversion to serviced suites"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="mt-1 h-9 bg-background border-border text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gap-2 py-6 text-xs uppercase tracking-widest font-semibold"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        Submitting Audit Request...
                      </span>
                    ) : (
                      <>
                        <span>Submit Confidential Asset Audit</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-primary">lock</span>
                    <span>Strict Fiduciary Confidentiality • Direct to Private Advisory Desk</span>
                  </p>
                </div>
              </motion.form>
            )}

            {step === "success" && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-medium text-foreground">
                    Audit Request Received
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Thank you, <span className="text-foreground font-semibold">{formData.name}</span>. A senior director from our Private Asset Advisory Desk will review your property data and reach out within 24 hours.
                  </p>
                </div>

                <div className="p-3 bg-secondary/30 rounded border border-border/60 text-[11px] text-muted-foreground max-w-sm mx-auto">
                  <span className="font-semibold text-foreground">Next Step:</span> We will prepare a preliminary Yield &amp; Repositioning Summary for your property in {formData.city || "your target region"}.
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      resetForm();
                    }}
                    className="text-xs"
                  >
                    Close Window
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
