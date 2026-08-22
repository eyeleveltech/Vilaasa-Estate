import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building,
  Mail,
  Phone,
  User,
  MapPin,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";

export const PartnerRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    experience: "5-10 years",
    city: "Dubai",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all mandatory contact fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/channel-partners/register", formData);
      if (res.data.success) {
        setSubmitted(true);
        toast.success("Institutional application submitted successfully");
      } else {
        toast.error(res.data.message || "Failed to submit application");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error submitting partner application";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground antialiased font-display">
      {/* Background Decorative Gradient Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[130px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-lg space-y-8 rounded-xl border border-border bg-card/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <Link to="/home">
              <img
                src={vilaasaLogo}
                alt="Vilaasa Estates"
                className="h-8 w-auto hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
          <div>
            <span className="uppercase tracking-[0.2em] text-[11px] font-bold text-primary">
              Institutional Onboarding
            </span>
            <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl mt-1">
              Become a <span className="font-serif italic text-primary">Channel Partner</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Join the premier luxury broker network across Dubai &amp; India prime assets
            </p>
          </div>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-primary/30 bg-primary/10 p-6 text-center space-y-4"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                Application Under Institutional Review
              </h3>
              <p className="text-xs text-muted-foreground">
                Thank you, <span className="font-semibold text-foreground">{formData.name}</span>. Our compliance team is verifying your broker credentials.
              </p>
              <p className="text-[11px] text-primary/90 pt-1">
                Estimated Turnaround: 24 to 48 business hours. You will receive an official approval email with portal access credentials.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild size="sm" className="gap-2 text-xs uppercase tracking-wider">
                <Link to="/home">Return to Homepage</Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Principal / Agent Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alistair Vance"
                  className="bg-background/80 pl-9 border-input text-xs sm:text-sm h-10"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Official Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="partner@agency.com"
                    className="bg-background/80 pl-9 border-input text-xs sm:text-sm h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone / WhatsApp *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="bg-background/80 pl-9 border-input text-xs sm:text-sm h-10"
                  />
                </div>
              </div>
            </div>

            {/* Brokerage & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Brokerage / Company
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Global Realty"
                    className="bg-background/80 pl-9 border-input text-xs sm:text-sm h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Primary Market / City
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Dubai, Mumbai, London"
                    className="bg-background/80 pl-9 border-input text-xs sm:text-sm h-10"
                  />
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <Label htmlFor="experience" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Luxury Real Estate Experience
              </Label>
              <div className="relative">
                <Award className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full rounded-md border border-input bg-background/80 pl-9 pr-3 text-xs sm:text-sm h-10 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="1-3 years">1 - 3 Years</option>
                  <option value="3-5 years">3 - 5 Years</option>
                  <option value="5-10 years">5 - 10 Years</option>
                  <option value="10+ years">10+ Years Established Practice</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 uppercase tracking-[0.15em] text-xs font-bold gap-2 mt-4"
            >
              <span>{loading ? "Submitting Application..." : "Submit Partner Application"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Existing Partner Link */}
        <div className="pt-2 text-center border-t border-border space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Already an authorized channel partner?
          </p>
          <Link
            to="/partner/login"
            className="text-xs font-semibold text-primary hover:underline uppercase tracking-wider inline-flex items-center gap-1"
          >
            <span>Log In to Partner Portal</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
