import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CountryCodeSelect } from "@/components/CountryCodeSelect";
import { useCurrency } from "@/contexts/CurrencyContext";
import api from "@/api/axios";

const interestOptions = [
  { id: "india", icon: "temple_hindu", label: "India Estate" },
  { id: "dubai", icon: "mosque", label: "Dubai Estate" },
  { id: "franchise", icon: "storefront", label: "Franchise" },
];

const budgetOptions = [
  { value: "", start: null, end: null },

  { value: "range-1", start: 10000000, end: 50000000 },
  { value: "range-2", start: 50000000, end: 100000000 },
  { value: "range-3", start: 100000000, end: 500000000 },
  { value: "range-4", start: 500000000, end: null },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    interests: [] as string[],
    budget: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatAmount } = useCurrency();

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const selectedBudget = budgetOptions.find((b) => b.value === formData.budget);

  let budgetDisplay = "";

  if (selectedBudget?.start !== null) {
    budgetDisplay = selectedBudget.end
      ? `${formatAmount(selectedBudget.start)} – ${formatAmount(selectedBudget.end)}`
      : `${formatAmount(selectedBudget.start)}+`;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: "Please fill in required fields",
        description: "Name, official email address, and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Invalid Email Address",
        description: "Please provide a valid official email address.",
        variant: "destructive",
      });
      return;
    }

    const numberOnlyRegex = /^[0-9]+$/;

    if (!numberOnlyRegex.test(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number should contain numbers only.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const clientEmail = formData.email.trim();

      // Submit directly to Vilaasa Express + PostgreSQL API
      await api.post("/inquiries", {
        name: formData.name.trim(),
        email: clientEmail,
        phone: `${formData.phoneCountryCode} ${formData.phone.trim()}`,
        investmentType: formData.interests.join(", ") || "Luxury Real Estate",
        investmentRange: budgetDisplay || "High Net Worth Portfolio",
        currency: "INR",
        source: "CONTACT_FORM",
        notes: `Client Interests: ${formData.interests.join(", ") || "Luxury Real Estate"}. Budget: ${budgetDisplay}`,
      });

      // Also forward to webhook if available
      try {
        await fetch("https://automate.eyelevelstudio.in/webhook/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: clientEmail,
            phone: `${formData.phoneCountryCode} ${formData.phone}`,
            interests: formData.interests,
            budget: budgetDisplay,
          }),
        });
      } catch {
        // Optional webhook fallback
      }

      toast({
        title: "Inquiry Submitted Successfully",
        description:
          "Thank you for your interest. A dedicated relationship manager will contact you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        interests: [],
        budget: "",
        phoneCountryCode: "+91",
      });
    } catch (error) {
      toast({
        title: "Error submitting form",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-x-hidden bg-background">
      <Navbar />

      {/* Hero Section */}
      <header className="px-4 pb-12 pt-24 sm:pb-14 sm:pt-28 md:px-10 md:pb-16 md:pt-32">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="mb-4 text-3xl font-light leading-[1.1] text-foreground font-luxia sm:mb-5 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
              Let's Discuss Your <br />
              <span className="italic text-primary">Portfolio.</span>
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Whether you are looking to acquire a home or expand a business,
              our team is ready.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Contact Info & Form */}
      <section className="px-4 py-12 sm:py-14 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8 sm:gap-10"
          >
            {/* Direct Line */}
            {/* <div className="flex flex-col gap-3">
              <span className="text-muted-foreground text-xs uppercase tracking-widest">
                Direct Line
              </span>
              <a
                href="tel:+917550001123"
                className="text-3xl md:text-4xl font-light text-foreground hover:text-primary transition-colors"
              >
                +91 7550001123
              </a>
              <p className="text-muted-foreground text-sm">
                Available Mon-Sat, 9:00 AM — 7:00 PM IST
              </p>
            </div> */}

            {/* Office Locations */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-8">
              {/* Chennai */}
              <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
                <span className="text-primary text-xs uppercase tracking-widest font-bold">
                  Chennai, India
                </span>
                <h3 className="text-foreground font-medium mt-3 mb-2">
                  Vilaasa Headquarters
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  43, 2nd Cross Street, 2nd Main Road
                  <br />
                  Navarathna Garden, Defence Colony
                  <br />
                  Ekkatuthangal, Chennai 600032
                </p>
                <a
                  href="https://www.google.com/maps?q=13.0223297,80.2011595&z=17&hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary text-sm mt-4 hover:underline"
                >
                  Get Directions
                  <span className="material-symbols-outlined text-sm">
                    north_east
                  </span>
                </a>
              </div>

              {/* Dubai */}
              <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
                <span className="text-accent text-xs uppercase tracking-widest font-bold">
                  Dubai, UAE
                </span>
                <h3 className="text-foreground font-medium mt-3 mb-2">
                  HJ Group
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  1104, SILVER TOWER, BUSINESS BAY
                  <br />
                  Dubai, United Arab Emirates
                </p>
                <a
                  href="https://maps.app.goo.gl/yfZJ7Y8nPWoMdNuw9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent text-sm mt-4 hover:underline"
                >
                  Get Directions
                  <span className="material-symbols-outlined text-sm">
                    north_east
                  </span>
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-xs uppercase tracking-widest">
                General Inquiries
              </span>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=info@vilaasaestates.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-lg hover:underline"
              >
                info@vilaasaestates.com
              </a>
            </div>
          </motion.div>

          {/* Right - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-lg border border-border bg-card p-4 sm:p-6 md:p-8 lg:p-10"
          >
            <h2 className="mb-2 text-xl font-light text-foreground sm:text-2xl">
              Request a Callback
            </h2>
            <p className="mb-6 text-sm text-muted-foreground sm:mb-8">
              Please provide your details below. A dedicated relationship
              manager will contact you within 24 hours.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 sm:gap-6"
            >
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-foreground text-sm font-medium"
                >
                  Full Name <span className="text-primary">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-background border border-border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
                  placeholder="Your full name"
                  maxLength={100}
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-foreground text-sm font-medium"
                >
                  Email Address <span className="text-primary">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="bg-background border border-border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
                  placeholder="your.email@example.com"
                  maxLength={100}
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="phone"
                  className="text-foreground text-sm font-medium"
                >
                  Phone Number
                </label>
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
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="000-0000"
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Interest Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-foreground text-sm font-medium">
                  I am interested in
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {interestOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleInterest(option.id)}
                      className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded border p-4 text-center transition-all ${
                        formData.interests.includes(option.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {option.icon}
                      </span>
                      <span className="text-xs font-medium">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="budget"
                  className="text-foreground text-sm font-medium"
                >
                  Estimated Budget
                </label>
                <div className="relative">
                  <select
                    id="budget"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        budget: e.target.value,
                      }))
                    }
                    className="w-full bg-background border border-border rounded px-4 py-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors cursor-pointer"
                  >
                    {budgetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.start === null
                          ? "Select Range"
                          : option.end
                            ? `${formatAmount(option.start)} – ${formatAmount(option.end)}`
                            : `${formatAmount(option.start)}+`}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
