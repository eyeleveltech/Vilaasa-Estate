import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CountryCodeSelect } from "./CountryCodeSelect";
import api from "@/api/axios";

export const ChannelPartnerSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to register.",
        variant: "destructive",
      });
      return;
    }

    // validate Phone Number
    const numberOnlyRegex = /^[0-9]+$/;

    if (!numberOnlyRegex.test(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number should contain numbers only.",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit directly to Vilaasa Express + PostgreSQL API
      await api.post("/inquiries", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: `${formData.phoneCountryCode} ${formData.phone}`.trim(),
        investmentType: "Channel Partner Agency Application",
        investmentRange: "Institutional Brokerage",
        currency: "INR",
        source: "CHANNEL_PARTNER_FORM",
        notes: `Channel Partner application received from ${formData.name}. Phone: ${formData.phoneCountryCode} ${formData.phone}`,
      });

      // 2. Also forward to webhook if available
      try {
        await fetch("https://automate.eyelevelstudio.in/webhook/9979b8b1-8114-4ebe-b1e2-6e2002bef970", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: `Phone: ${formData.phoneCountryCode} ${formData.phone} - I am interested in becoming a channel partner.`,
          }),
        });
      } catch {
        // Optional webhook fallback
      }

      toast({
        title: "Registration Successful!",
        description:
          "Thank you for your interest. Our institutional partnerships team will contact you within 24 hours.",
      });

      setFormData({ name: "", email: "", phone: "", phoneCountryCode: "+91" });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="bg-primary/5 px-4 py-12 sm:py-14 md:px-10 md:py-20"
      id="channel-partner"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 items-start gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col gap-5 sm:gap-6"
          >
            <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold">
              Partnership
            </span>
            <h2 className="text-3xl font-light text-foreground leading-[1.1] sm:text-4xl md:text-5xl">
              Become a <br />
              <span className="font-serif italic">Channel Partner</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
              Join our exclusive network of real estate and franchise partners.
              Earn premium commissions while offering your clients access to
              curated investment opportunities across India and the globe.
            </p>

            <div className="mt-2 grid grid-cols-1 gap-4 sm:gap-5 md:mt-4 md:grid-cols-2 md:gap-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                  payments
                </span>
                <div>
                  <h4 className="font-bold text-foreground">
                    High Commissions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Industry-leading payouts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                  support_agent
                </span>
                <div>
                  <h4 className="font-bold text-foreground">
                    Dedicated Support
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Personal relationship manager
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                  workspace_premium
                </span>
                <div>
                  <h4 className="font-bold text-foreground">
                    Exclusive Access
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Pre-launch inventory rights
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                  school
                </span>
                <div>
                  <h4 className="font-bold text-foreground">
                    Training Programs
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Continuous skill development
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-lg border border-border bg-background p-4 shadow-lg sm:p-6 md:p-8"
          >
            <h3 className="mb-5 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
              Register as a Partner
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Full Name</Label>
                <Input
                  id="partnerName"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnerEmail">Email Address</Label>
                <Input
                  id="partnerEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnerPhone">Phone Number</Label>
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                  <CountryCodeSelect
                    value={formData.phoneCountryCode}
                    onChange={(code) =>
                      setFormData({
                        ...formData,
                        phoneCountryCode: code,
                      })
                    }
                  />
                  <Input
                    id="partnerPhone"
                    type="tel"
                    placeholder="0000-000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-background border-border"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2">
                      progress_activity
                    </span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2">
                      handshake
                    </span>
                    Register Now
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
