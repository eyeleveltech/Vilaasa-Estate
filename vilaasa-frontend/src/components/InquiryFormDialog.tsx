import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { CountryCodeSelect } from "./CountryCodeSelect";
import { useCurrency } from "@/contexts/CurrencyContext";
import { markOtpVerified, isOtpVerified, getSavedLeadProfile } from "@/lib/otpAccess";
import api from "@/api/axios";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "response" in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

interface InquiryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectType?: "real-estate" | "franchise";
  projectId?: string;
  projectName?: string;
  notes?: string;
  intent?: "unlock_view" | "inquiry";
  customTitle?: string;
  customSubtitle?: string;
  onVerified?: () => void;
}

const LEAD_PROFILE_STORAGE_KEY = "vilaasa-lead-profile";

const budgetOptions = [
  { value: "range-1", start: 10000000, end: 20000000 },
  { value: "range-2", start: 20000000, end: 40000000 },
  { value: "range-3", start: 40000000, end: 60000000 },
  { value: "range-4", start: 60000000, end: 80000000 },
  { value: "range-5", start: 80000000, end: 100000000 },
  { value: "range-6", start: 100000000, end: 150000000 },
  { value: "range-7", start: 150000000, end: 200000000 },
  { value: "range-8", start: 200000000, end: null },
] as const;

export const InquiryFormDialog = ({
  open,
  onOpenChange,
  projectType,
  projectId,
  projectName,
  notes,
  intent = "unlock_view",
  customTitle,
  customSubtitle,
  onVerified,
}: InquiryFormDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatAmount, currency } = useCurrency();
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [formData, setFormData] = useState({
    name: "",
    phoneCountryCode: "+91",
    phone: "",
    email: "",
    investmentType: projectType || "real-estate",
    investmentRange: "",
  });
  const [otp, setOtp] = useState("");

  // Prepopulate saved lead profile if available
  useEffect(() => {
    if (open) {
      const saved = getSavedLeadProfile();
      if (saved) {
        setFormData((prev) => ({
          ...prev,
          name: saved.name || prev.name,
          email: saved.email || prev.email,
          phone: saved.phone || prev.phone,
          phoneCountryCode: saved.phoneCountryCode || prev.phoneCountryCode,
        }));
      }
    }
  }, [open]);

  // Resend OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const persistLeadProfile = () => {
    if (typeof window === "undefined") return;
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
  };

  const investmentRangeOptions = useMemo(
    () =>
      budgetOptions.map((option) => ({
        value: option.value,
        label: option.end
          ? `${formatAmount(option.start)} - ${formatAmount(option.end)}`
          : `${formatAmount(option.start)}+`,
      })),
    [formatAmount],
  );

  const getSelectedInvestmentRangeLabel = (value: string) =>
    investmentRangeOptions.find((option) => option.value === value)?.label ||
    value ||
    "Private Client Advisory";

  // Step 1: Request OTP Code (or direct submit if already OTP-verified)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUnlock = intent === "unlock_view";

    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      (!isUnlock && (!formData.investmentType || !formData.investmentRange))
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to continue.",
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // 🚀 If user already verified OTP in the last 2 hours -> Skip OTP popup!
    if (isOtpVerified()) {
      setIsSubmitting(true);
      try {
        persistLeadProfile();
        onVerified?.();

        await api.post("/inquiries", {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: `${formData.phoneCountryCode} ${formData.phone}`.trim(),
          investmentType: formData.investmentType || projectType || "real-estate",
          investmentRange: formData.investmentRange
            ? getSelectedInvestmentRangeLabel(formData.investmentRange)
            : isUnlock
              ? "Portfolio Viewer"
              : "Private Client Advisory",
          currency: currency || "INR",
          propertyId: projectId || undefined,
          source: projectId
            ? projectType === "franchise"
              ? "FRANCHISE_DETAIL"
              : "PROPERTY_DETAIL"
            : "HERO_INQUIRY",
          notes: notes || (isUnlock ? "Confidential Dossier Unlocked (View Only)" : "Direct Inquiry with Senior Partner"),
          sendEmail: !isUnlock,
          intent: isUnlock ? "UNLOCK_VIEW" : "INQUIRY",
        });

        setStep("success");
        toast({
          title: isUnlock ? "Dossier Unlocked" : "Inquiry Submitted",
          description: isUnlock
            ? "Access granted to architectural assets and floor plans."
            : "Inquiry submitted under your verified session. A Senior Partner will contact you shortly.",
        });

        setTimeout(() => {
          onOpenChange(false);
          if (projectId) {
            navigate(projectType === "real-estate" ? `/property/${projectId}` : `/franchise/${projectId}`);
          }
          setStep("form");
        }, 1200);
      } catch (error: unknown) {
        toast({
          title: "Submission Error",
          description: getErrorMessage(error, "Something went wrong"),
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // If not verified or 2 hours expired -> Proceed with standard OTP request:
    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/otp/send", {
        email: formData.email.trim(),
      });

      if (res.data.success) {
        setStep("otp");
        setResendTimer(60);
        toast({
          title: "OTP Sent",
          description: `A 6-digit security code has been sent to ${formData.email}`,
        });
      }
    } catch (error: unknown) {
      console.error("Error requesting OTP:", error);
      toast({
        title: "Submission Error",
        description: getErrorMessage(error, "Something went wrong, please try again"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Complete Action
  const handleOtpVerify = async () => {
    if (otp.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Verify OTP with backend
      const verifyRes = await api.post("/auth/otp/verify", {
        email: formData.email.trim(),
        otp: otp.trim(),
      });

      if (!verifyRes.data.success) {
        toast({
          title: "Verification Error",
          description: "Invalid OTP, please try again",
          variant: "destructive",
        });
        return;
      }

      persistLeadProfile();
      markOtpVerified();
      onVerified?.();

      const isUnlock = intent === "unlock_view";

      // 2. Submit Inquiry record: sendEmail is FALSE for unlock_view, TRUE for inquiry
      await api.post("/inquiries", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: `${formData.phoneCountryCode} ${formData.phone}`.trim(),
        investmentType: formData.investmentType || projectType || "real-estate",
        investmentRange: formData.investmentRange
          ? getSelectedInvestmentRangeLabel(formData.investmentRange)
          : isUnlock
            ? "Portfolio Viewer"
            : "Private Client Advisory",
        currency: currency || "INR",
        propertyId: projectId || undefined,
        source: projectId
          ? projectType === "franchise"
            ? "FRANCHISE_DETAIL"
            : "PROPERTY_DETAIL"
          : "HERO_INQUIRY",
        notes: notes || (isUnlock ? "Confidential Dossier Unlocked (View Only)" : "Direct Inquiry with Senior Partner"),
        sendEmail: !isUnlock,
        intent: isUnlock ? "UNLOCK_VIEW" : "INQUIRY",
      });

      setStep("success");
      toast({
        title: isUnlock ? "Dossier Unlocked" : "Verified Successfully",
        description: isUnlock
          ? "Identity confirmed. Unlocking confidential dossier..."
          : "Your inquiry has been submitted. A Senior Partner will contact you shortly.",
      });

      setTimeout(() => {
        onOpenChange(false);
        if (projectId) {
          if (projectType === "real-estate") {
            navigate(`/property/${projectId}`);
          } else {
            navigate(`/franchise/${projectId}`);
          }
        }

        setStep("form");
        setFormData({
          name: "",
          phone: "",
          phoneCountryCode: "+91",
          email: "",
          investmentType: projectType || "real-estate",
          investmentRange: "",
        });
        setOtp("");
      }, 1500);
    } catch (error: unknown) {
      console.error("Error during OTP verification:", error);
      const msg = getErrorMessage(error, "");
      if (msg.toLowerCase().includes("expired")) {
        toast({
          title: "OTP Expired",
          description: "OTP expired, please request a new one",
          variant: "destructive",
        });
      } else if (msg.toLowerCase().includes("invalid")) {
        toast({
          title: "Invalid OTP",
          description: "Invalid OTP, please check and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification Error",
          description: msg || "Something went wrong, please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsSubmitting(true);
    setOtp("");
    try {
      const res = await api.post("/auth/otp/send", {
        email: formData.email.trim(),
      });

      if (res.data.success) {
        setResendTimer(60);
        toast({
          title: "OTP Resent",
          description: `A new 6-digit security code was sent to ${formData.email}`,
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Resend Error",
        description: getErrorMessage(error, "Something went wrong, please try again"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md max-h-[90vh] overflow-y-auto bg-background border-border p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-light">
            {step === "form" &&
              (customTitle || (intent === "inquiry" ? "Contact Senior Partner" : "Unlock Confidential Dossier"))}
            {step === "otp" && "Verify Security Code"}
            {step === "success" && (intent === "inquiry" ? "Inquiry Confirmed" : "Dossier Unlocked")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
            {step === "form" &&
              (customSubtitle ||
                (projectName
                  ? intent === "inquiry"
                    ? `Connect directly with our senior luxury advisory team for ${projectName}.`
                    : `Verify your identity to access full architectural floor plans, high-res photography, and specifications for ${projectName}.`
                  : "Please share your details to proceed."))}
            {step === "otp" &&
              `Enter the 6-digit security code sent to ${formData.email}`}
            {step === "success" &&
              (intent === "inquiry"
                ? "Your bespoke advisory request has been dispatched to our Senior Partner."
                : "Your identity has been verified. You now have privileged access to this dossier.")}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleFormSubmit}
              className="space-y-3 sm:space-y-4 mt-2 sm:mt-4"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Lord Arthur Wellesley"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-secondary/50 h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. wellesley@kensington.co.uk"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-secondary/50 h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm">
                  Phone Number *
                </Label>
                <div className="flex gap-2">
                  <CountryCodeSelect
                    value={formData.phoneCountryCode}
                    onChange={(code) =>
                      setFormData({ ...formData, phoneCountryCode: code })
                    }
                  />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    className="flex-1 bg-secondary/50 h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {intent === "inquiry" && (
                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="investmentRange"
                    className="text-xs sm:text-sm"
                  >
                    Target Allocation Range *
                  </Label>
                  <Select
                    value={formData.investmentRange}
                    onValueChange={(value) =>
                      setFormData({ ...formData, investmentRange: value })
                    }
                    required
                  >
                    <SelectTrigger className="bg-secondary/50 h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Select target allocation" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentRangeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-xs sm:text-sm"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4 sm:mt-6 h-9 sm:h-10 text-xs sm:text-sm uppercase tracking-wider font-semibold"
              >
                {isSubmitting
                  ? "Processing..."
                  : intent === "inquiry"
                    ? "Connect with Senior Partner"
                    : "Verify & Unlock Dossier"}
              </Button>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 sm:space-y-6 mt-2 sm:mt-4"
            >
              <div className="flex justify-center py-2 sm:py-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(val) => setOtp(val)}
                >
                  <InputOTPGroup className="gap-1.5 sm:gap-2">
                    <InputOTPSlot
                      index={0}
                      className="w-9 h-11 sm:w-11 sm:h-12 text-base sm:text-lg bg-secondary/50 border-border"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-9 h-11 sm:w-11 sm:h-12 text-base sm:text-lg bg-secondary/50 border-border"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-9 h-11 sm:w-11 sm:h-12 text-base sm:text-lg bg-secondary/50 border-border"
                    />
                    <InputOTPSlot
                      index={3}
                      className="w-9 h-11 sm:w-11 sm:h-12 text-base sm:text-lg bg-secondary/50 border-border"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-9 h-11 sm:w-11 sm:h-12 text-base sm:text-lg bg-secondary/50 border-border"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-9 h-11 sm:w-11 sm:h-12 text-base sm:text-lg bg-secondary/50 border-border"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="hover:text-foreground underline transition-colors"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isSubmitting}
                  className="hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0
                    ? `Resend Code in ${resendTimer}s`
                    : "Resend Code"}
                </button>
              </div>

              <Button
                onClick={handleOtpVerify}
                disabled={isSubmitting || otp.length < 6}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-10 text-xs sm:text-sm uppercase tracking-wider font-semibold"
              >
                {isSubmitting ? "Verifying..." : "Verify & Unlock Access"}
              </Button>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 sm:py-8 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center">
                ✓
              </div>
              <p className="text-sm text-muted-foreground">
                Access Granted. Enjoy exploring our luxury estates.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
