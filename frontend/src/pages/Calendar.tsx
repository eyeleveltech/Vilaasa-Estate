import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
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
import { Property, ApiResponse } from "@/admin/types/admin.types";

const standardSlots = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const visitTypes = [
  { value: "real-estate-india", label: "India Real Estate Inspection" },
  {
    value: "real-estate-international",
    label: "Dubai & International Portfolio",
  },
  { value: "franchise", label: "Institutional Franchise Advisory" },
  { value: "general", label: "Private Wealth Client Consultation" },
];

const Calendar_Page = () => {
  const LEAD_PROFILE_STORAGE_KEY = "vilaasa-lead-profile";
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [visitType, setVisitType] = useState<string>("real-estate-india");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const [availableSlots, setAvailableSlots] = useState<string[]>(standardSlots);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load properties for estate selector
  useEffect(() => {
    const loadProps = async () => {
      try {
        const res = await api.get<ApiResponse<Property[]>>("/properties", {
          params: { limit: 50 },
        });
        if (res.data.success) {
          setProperties(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedPropertyId(res.data.data[0].id);
          }
        }
      } catch {
        // quiet fallback
      }
    };
    loadProps();
  }, []);



  // Dynamic Slot Availability Fetcher
  const fetchSlots = useCallback(async (date: Date, propertyId?: string) => {
    setLoadingSlots(true);
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      const params: Record<string, string> = { date: dateStr };
      if (propertyId) params.propertyId = propertyId;

      const res = await api.get<
        ApiResponse<{
          allSlots: string[];
          bookedSlots: string[];
          availableSlots: string[];
        }>
      >("/site-visits/slots", { params });

      if (res.data.success) {
        setAvailableSlots(res.data.data.availableSlots || standardSlots);
        setBookedSlots(res.data.data.bookedSlots || []);
      }
    } catch {
      setAvailableSlots(standardSlots);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate, selectedPropertyId);
      setSelectedTime("");
    }
  }, [selectedDate, selectedPropertyId, fetchSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedDate ||
      !selectedTime ||
      !visitType ||
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please select a date, time slot, and fill in your name, email, and phone number.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Invalid Email Address",
        description: "Please provide a valid email address to receive your VIP inspection itinerary.",
        variant: "destructive",
      });
      return;
    }

    const numberOnlyRegex = /^[0-9]+$/;
    if (!numberOnlyRegex.test(formData.phone.trim())) {
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

      const targetPropertyId =
        selectedPropertyId || properties[0]?.id || "palm-royale-default";

      // Normalize to midday local date to avoid midnight UTC day-shift
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(12, 0, 0, 0);

      // Submit directly to Vilaasa Site Visits API (also auto-logs into CRM inquiry pipeline)
      await api.post("/site-visits", {
        propertyId: targetPropertyId,
        name: formData.name.trim(),
        email: clientEmail,
        phone: `${formData.phoneCountryCode} ${formData.phone}`.trim(),
        scheduledDate: normalizedDate.toISOString(),
        scheduledTime: selectedTime,
        visitType,
        notes: formData.notes?.trim() || undefined,
      });

      const selectedProp = properties.find((p) => p.id === targetPropertyId);

      toast({
        title: "Private Inspection Confirmed!",
        description: `Your inspection for ${selectedProp?.name || "Vilaasa Estate"} is confirmed for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
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
          console.error("Failed to save lead profile:", error);
        }
      }

      // Reset form
      setSelectedTime("");
      setSelectedDate(undefined);
      setFormData({
        name: "",
        email: "",
        phone: "",
        phoneCountryCode: "+91",
        notes: "",
      });
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error?.response?.status === 409) {
        toast({
          title: "Slot Unavailable",
          description:
            "This slot was just booked by another client, please choose another time.",
          variant: "destructive",
        });
        if (selectedDate) {
          fetchSlots(selectedDate, selectedPropertyId);
        }
      } else {
        toast({
          title: "Booking Failed",
          description:
            error?.response?.data?.message ||
            "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable past dates and Sundays
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Schedule a Private Site Visit | Vilaasa Concierge"
        description="Book a personalized architectural walkthrough or virtual consultation with our Senior Estate Directors."
        canonical="https://www.vilaasaestates.com/calendar"
      />
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
              Private Concierge
            </span>
            <h1 className="mb-4 mt-3 text-3xl font-light sm:mt-4 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
              Book Your <span className="font-serif italic">Private Visit</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Select your preferred estate, date, and exclusive time slot for a
              personalized architectural walkthrough with our Senior Estate
              Ambassador.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Calendar Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-xl"
            >
              <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
                1. Select Estate & Inspection Date
              </h2>

              {/* Property Selector */}
              {properties.length > 0 && (
                <div className="mb-6 space-y-2">
                  <Label htmlFor="propSelect" className="text-xs font-semibold">
                    Target Estate / Destination
                  </Label>
                  <Select
                    value={selectedPropertyId}
                    onValueChange={setSelectedPropertyId}
                  >
                    <SelectTrigger
                      id="propSelect"
                      className="bg-background border-border"
                    >
                      <SelectValue placeholder="Select Estate" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.location.city}, {p.location.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-foreground">
                        Inspection Slots for{" "}
                        <span className="text-[#D4AF37] font-semibold">
                          {selectedDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </h3>
                      {loadingSlots && (
                        <span className="text-xs text-[#a0a0a0] animate-pulse">
                          Checking slots...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {standardSlots.map((time) => {
                        const isBooked = bookedSlots.includes(time);
                        const isSelected = selectedTime === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedTime(time)}
                            className={`h-11 rounded-lg border text-xs font-semibold transition-all sm:h-auto sm:p-3 sm:text-sm ${
                              isSelected
                                ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 font-bold"
                                : isBooked
                                  ? "border-red-500/20 bg-red-500/5 text-[#ef4444] line-through opacity-50 cursor-not-allowed"
                                  : "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10 text-[#22c55e]"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
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
              className="rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-xl"
            >
              <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
                2. Guest Itinerary Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="visitType">Advisory Category *</Label>
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
                    placeholder="e.g. Lord Arthur Wellesley"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calEmail">Email Address *</Label>
                  <Input
                    id="calEmail"
                    type="email"
                    required
                    placeholder="e.g. wellesley@kensington.co.uk"
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
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      className="bg-background border-border flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calNotes">Special Requests / Chauffeur Requirements</Label>
                  <Input
                    id="calNotes"
                    placeholder="e.g. Helipad arrival / Private helicopter landing"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="bg-background border-border"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedDate || !selectedTime}
                  className="w-full bg-[#D4AF37] text-black hover:bg-[#c49f27] font-bold py-6 text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Confirming Inspection..."
                    : selectedDate && selectedTime
                      ? `Confirm Inspection on ${selectedDate.toLocaleDateString()} at ${selectedTime}`
                      : "Pick Date & Slot to Confirm"}
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
