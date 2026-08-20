import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CountryCodeSelect } from "@/components/CountryCodeSelect";
import api from "@/api/axios";

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const visitTypes = [
  { value: "real-estate-india", label: "India Real Estate" },
  { value: "real-estate-international", label: "International Real Estate" },
  { value: "franchise", label: "Franchise Opportunities" },
  { value: "general", label: "General Consultation" },
];

const Calendar_Page = () => {
  const LEAD_PROFILE_STORAGE_KEY = "vilaasa-lead-profile";
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [visitType, setVisitType] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LEAD_PROFILE_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        name?: string;
        email?: string;
        phone?: string;
        phoneCountryCode?: string;
      };

      setFormData((prev) => ({
        ...prev,
        name: saved.name || prev.name,
        email: saved.email || prev.email,
        phone: saved.phone || prev.phone,
        phoneCountryCode: saved.phoneCountryCode || prev.phoneCountryCode,
      }));
    } catch (error) {
      console.error("Failed to read saved lead profile:", error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedDate ||
      !selectedTime ||
      !visitType ||
      !formData.name ||
      !formData.phone
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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
      const clientEmail =
        formData.email?.trim() ||
        `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "client"}@vip-client.com`;

      // 1. Submit directly to Vilaasa Express + PostgreSQL API
      await api.post("/inquiries", {
        name: formData.name.trim(),
        email: clientEmail,
        phone: `${formData.phoneCountryCode} ${formData.phone}`.trim(),
        investmentType: visitType === "real-estate-india" ? "India Real Estate" : "Dubai / International Real Estate",
        investmentRange: "Private Client Advisory",
        currency: "INR",
        source: "CALENDAR_PAGE",
        notes: `Private site visit booking on ${selectedDate.toLocaleDateString()} at ${selectedTime}. Note: ${formData.notes || "None"}`,
      });

      // 2. Also forward to webhook if available
      try {
        await fetch("https://automate.eyelevelstudio.in/webhook/site-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: `${formData.phoneCountryCode} ${formData.phone}`.trim(),
            email: clientEmail,
            note: formData.notes?.trim() || "",
            date: selectedDate.toISOString(),
            time: selectedTime,
            visitType,
          }),
        });
      } catch {
        // Optional webhook fallback
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your site visit is scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}. You'll receive a calendar invite shortly.`,
      });

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            LEAD_PROFILE_STORAGE_KEY,
            JSON.stringify({
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              phoneCountryCode: formData.phoneCountryCode.trim(),
              updatedAt: new Date().toISOString(),
            }),
          );
        } catch (error) {
          console.error("Failed to persist lead profile:", error);
        }
      }

      // optional delay (only after success)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime("");
      setVisitType("");
      setFormData({
        name: "",
        email: "",
        phone: "",
        notes: "",
        phoneCountryCode: "+91",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable past dates and weekends
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0; // Disable Sundays and past dates
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 pb-14 pt-24 sm:pb-16 sm:pt-28 md:px-10 md:pb-20 md:pt-32">
        <div className="max-w-[1280px] mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center sm:mb-12 md:mb-16"
          >
            <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold">
              Schedule a Visit
            </span>
            <h1 className="mb-4 mt-3 text-3xl font-light sm:mt-4 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
              Book Your <span className="font-serif italic">Site Visit</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Select your preferred date and time for a personalized walkthrough
              of our exclusive properties and franchise opportunities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Calendar Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-lg border border-border bg-card p-4 sm:p-6 md:p-8"
            >
              <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
                Select Date & Time
              </h2>

              <div className="flex flex-col items-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  className="w-full max-w-[22rem] rounded-md border border-border p-2 pointer-events-auto sm:max-w-none sm:p-3"
                />

                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 w-full sm:mt-8"
                  >
                    <h3 className="text-sm font-medium text-foreground mb-4">
                      Available Time Slots for{" "}
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`h-10 rounded-md border px-2 text-xs transition-colors sm:h-auto sm:p-3 sm:text-sm ${
                            selectedTime === time
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary/50 text-foreground"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-lg border border-border bg-card p-4 sm:p-6 md:p-8"
            >
              <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
                Your Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="visitType">Type of Visit *</Label>
                  <Select value={visitType} onValueChange={setVisitType}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {visitTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calName">Full Name *</Label>
                  <Input
                    id="calName"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calEmail">Email Address</Label>
                  <Input
                    id="calEmail"
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
                  <Label htmlFor="calPhone">Phone Number *</Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                      id="calPhone"
                      type="tel"
                      placeholder="0000-0000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full bg-background border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calNotes">Additional Notes</Label>
                  <Input
                    id="calNotes"
                    placeholder="Any specific requirements or questions"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="bg-background border-border"
                  />
                </div>

                {/* Summary */}
                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-primary/10 rounded-lg"
                  >
                    <p className="text-sm font-medium text-foreground">
                      Booking Summary
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at {selectedTime}
                    </p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !selectedDate || !selectedTime}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin mr-2">
                        progress_activity
                      </span>
                      Booking...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined mr-2">
                        event_available
                      </span>
                      Confirm Booking
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Calendar_Page;
