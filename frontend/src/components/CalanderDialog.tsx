import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, User, Mail, Phone } from "lucide-react";
import api from "@/api/axios";

interface CalanderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    date: Date;
    time: string;
    name: string;
    email: string;
    phone: string;
    notes?: string;
  }) => void;
  propertyName: string;
  propertyId?: string;
}

const standardSlots = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const LEAD_PROFILE_STORAGE_KEY = "vilaasa-lead-profile";

export const CalanderDialog = ({
  open,
  onOpenChange,
  onConfirm,
  propertyName,
  propertyId,
}: CalanderDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>(standardSlots);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Client Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Load saved lead profile on open
  useEffect(() => {
    if (open) {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(LEAD_PROFILE_STORAGE_KEY);
          if (raw) {
            const saved = JSON.parse(raw);
            if (saved.name) setName(saved.name);
            if (saved.email) setEmail(saved.email);
            if (saved.phone) {
              const code = saved.phoneCountryCode || "";
              setPhone(code ? `${code} ${saved.phone}`.trim() : saved.phone);
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    } else {
      // Reset selections on close
      setSelectedDate(undefined);
      setSelectedTime("");
      setBookedSlots([]);
    }
  }, [open]);

  // Fetch real-time available slots for the selected date
  const fetchSlots = useCallback(
    async (date: Date) => {
      setLoadingSlots(true);
      try {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const params: Record<string, string> = { date: dateStr };
        if (propertyId) params.propertyId = propertyId;

        const res = await api.get("/site-visits/slots", { params });
        if (res.data.success && res.data.data) {
          setAvailableSlots(res.data.data.availableSlots || standardSlots);
          setBookedSlots(res.data.data.bookedSlots || []);
        }
      } catch {
        setAvailableSlots(standardSlots);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [propertyId],
  );

  useEffect(() => {
    if (selectedDate) {
      void fetchSlots(selectedDate);
      setSelectedTime("");
    }
  }, [selectedDate, fetchSlots]);

  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !name.trim() || !email.trim() || !phone.trim()) {
      return;
    }

    // Persist lead profile
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          LEAD_PROFILE_STORAGE_KEY,
          JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            updatedAt: new Date().toISOString(),
          }),
        );
      } catch {
        // ignore
      }
    }

    onConfirm({
      date: selectedDate,
      time: selectedTime,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg max-h-[90vh] overflow-y-auto bg-background border-border p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-light leading-tight">
            Schedule Private Inspection — {propertyName}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select an available date and time for an exclusive private walkthrough accompanied by our Senior Partner.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key="calendar-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5 mt-3"
          >
            {/* 1. Date Picker */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                1. Select Inspection Date
              </Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disabledDays}
                className="mx-auto w-full rounded-md border p-2 sm:p-3"
              />
            </div>

            {/* 2. Slot Picker */}
            {selectedDate && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    2. Choose Available Time Slot
                  </Label>
                  {loadingSlots && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                      Checking availability...
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
                        className={`h-10 text-xs sm:text-sm rounded-md border transition relative flex items-center justify-center font-medium ${
                          isBooked
                            ? "opacity-40 line-through bg-muted/30 border-muted text-muted-foreground cursor-not-allowed"
                            : isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "hover:border-primary/60 hover:bg-muted/50 border-border text-foreground"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>

                {bookedSlots.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" /> Strikethrough slots are already reserved for this date.
                  </p>
                )}
              </div>
            )}

            {/* 3. Client Contact Details */}
            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 pt-2 border-t border-border"
              >
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  3. Contact & Itinerary Details
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" /> Full Name *
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="h-9 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Mobile Number *
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email Address (Itinerary Destination) *
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@investment.com"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Special Requests / Dietary / Chauffeur Notes (Optional)
                  </Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Visiting with legal counsel"
                    className="h-9 text-sm"
                  />
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="w-full sm:flex-1"
                disabled={
                  !selectedDate ||
                  !selectedTime ||
                  !name.trim() ||
                  !email.trim() ||
                  !phone.trim()
                }
                onClick={handleConfirm}
              >
                Confirm Private Inspection
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
