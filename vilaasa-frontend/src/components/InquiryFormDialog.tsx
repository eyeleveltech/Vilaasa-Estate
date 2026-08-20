import { useMemo, useState } from "react";
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
import { markOtpVerified } from "@/lib/otpAccess";

interface InquiryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectType?: "real-estate" | "franchise";
  projectId?: string;
  projectName?: string;
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
  onVerified,
}: InquiryFormDialogProps) => {
  const OTP_REQUEST_URL =
    "https://automate.eyelevelstudio.in/webhook/otp/request";
  const OTP_VERIFY_URL =
    "https://automate.eyelevelstudio.in/webhook/otp/verify";
  const OTP_RESEND_URL =
    "https://automate.eyelevelstudio.in/webhook/otp/resend";
  const INQUIRY_STORE_URL =
    "https://automate.eyelevelstudio.in/webhook/inquires-data";

  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatAmount, currency } = useCurrency();
  const [formData, setFormData] = useState({
    name: "",
    phoneCountryCode: "+91",
    phone: "",
    email: "",
    investmentType: projectType || "",
    investmentRange: "",
  });
  const [otp, setOtp] = useState("");

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
    "";

  const parseJsonSafely = async (response: Response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return null;
    }
  };

  const normalizeApiData = (
    raw: unknown,
  ): {
    ok?: boolean;
    success?: boolean;
    status?: string;
    code?: string;
    message?: string;
  } | null => {
    if (!raw) return null;
    if (Array.isArray(raw)) {
      const first = raw[0];
      if (first && typeof first === "object") return normalizeApiData(first);
      return null;
    }
    if (typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      return {
        ok: typeof obj.ok === "boolean" ? obj.ok : undefined,
        success: typeof obj.success === "boolean" ? obj.success : undefined,
        status:
          typeof obj.status === "string"
            ? obj.status
            : typeof obj.Status === "string"
              ? obj.Status
              : undefined,
        code:
          typeof obj.code === "string"
            ? obj.code
            : typeof obj.Code === "string"
              ? obj.Code
              : undefined,
        message:
          typeof obj.message === "string"
            ? obj.message
            : typeof obj.Message === "string"
              ? obj.Message
              : undefined,
      };
    }
    return null;
  };

  const getApiMessage = (raw: unknown) => {
    const data = normalizeApiData(raw);
    return typeof data?.message === "string" ? data.message : undefined;
  };

  const isApiSuccess = (
    response: Response,
    rawData: unknown,
    acceptedCodes: string[] = [],
    acceptedStatuses: string[] = [],
  ) => {
    const data = normalizeApiData(rawData);
    const normalizedStatus =
      typeof data?.status === "string" ? data.status.toUpperCase() : "";
    return (
      response.ok &&
      (data?.ok === true ||
        data?.success === true ||
        normalizedStatus === "SUCCESS" ||
        (typeof data?.code === "string" && acceptedCodes.includes(data.code)) ||
        acceptedStatuses.includes(normalizedStatus))
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.investmentType ||
      !formData.investmentRange
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to continue.",
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

    setIsSubmitting(true);

    try {
      const response = await fetch(OTP_REQUEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await parseJsonSafely(response);
      const isSuccess = isApiSuccess(response, data, ["OTP_SENT"]);

      if (!isSuccess) {
        toast({
          title: "Submission Error",
          description:
            "There was an error submitting your inquiry. Please try again later.",
          variant: "destructive",
        });
      } else {
        setStep("otp");
        const message =
          getApiMessage(data) || "OTP has been sent to your email.";
        toast({
          title: "OTP Sent",
          description: `${message} ${formData.email}`,
        });
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast({
        title: "Submission Error",
        description:
          "There was an error submitting your inquiry. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      const verifyResponse = await fetch(OTP_VERIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp,
          email: formData.email,
        }),
      });
      const verifyData = await parseJsonSafely(verifyResponse);
      const isVerified = isApiSuccess(
        verifyResponse,
        verifyData,
        ["OTP_VERIFIED"],
        ["VERIFIED", "VERIFYED", "VERIFYED_SUCCESS"],
      );

      if (!isVerified) {
        toast({
          title: "Verification Error",
          description:
            getApiMessage(verifyData) ||
            "The OTP you entered is incorrect. Please try again.",
          variant: "destructive",
        });
        return;
      }

      persistLeadProfile();
      markOtpVerified();
      onVerified?.();

      const storeResponse = await fetch(INQUIRY_STORE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phoneCountryCode + formData.phone,
          investmentType: formData.investmentType,
          investmentCurrency: currency,
          investmentRange: getSelectedInvestmentRangeLabel(
            formData.investmentRange,
          ),
          investmentRangeKey: formData.investmentRange,
          projectId,
          projectName,
          projectType,
          source: "inquiry-dialog",
          submittedAt: new Date().toISOString(),
        }),
      });
      const storeData = await parseJsonSafely(storeResponse);
      const isStored = isApiSuccess(storeResponse, storeData, [
        "INQUIRY_SAVED",
        "INQUIRY_STORED",
      ]);

      if (!isStored) {
        toast({
          title: "Submission Error",
          description:
            getApiMessage(storeData) ||
            "OTP verified, but we could not save your inquiry. Please try again.",
          variant: "destructive",
        });
      } else {
        setStep("success");
        toast({
          title: "Verified Successfully",
          description: "Redirecting to project details...",
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
            investmentType: projectType || "",
            investmentRange: "",
          });
          setOtp("");
        }, 1500);
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      toast({
        title: "Verification Error",
        description:
          "There was an error verifying your OTP. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    setOtp("");
    try {
      const response = await fetch(OTP_RESEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData }),
      });

      const data = await parseJsonSafely(response);
      const isSuccess = isApiSuccess(response, data, [
        "OTP_SENT",
        "OTP_RESENT",
      ]);

      if (!isSuccess) {
        toast({
          title: "Resend Error",
          description:
            "There was an error resending OTP. Please try again later.",
          variant: "destructive",
        });
      } else {
        const message =
          getApiMessage(data) || "OTP has been resent to your email.";
        toast({
          title: "OTP Resent",
          description: `${message} ${formData.email}`,
        });
      }
    } catch (error) {
      console.error("Error during OTP resend:", error);
      toast({
        title: "Resend Error",
        description:
          "There was an error resending OTP. Please try again later.",
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
            {step === "form" && "Express Your Interest"}
            {step === "otp" && "Verify Your email"}
            {step === "success" && "Verification Complete"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === "form" &&
              (projectName
                ? `Inquiring about: ${projectName}`
                : "Fill in your details to learn more")}
            {step === "otp" && "Enter the OTP sent to your Email"}
            {step === "success" &&
              "You now have access to detailed project information"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleFormSubmit}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>

                <div className="flex flex-col sm:flex-row gap-2">
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
                    type="tel"
                    placeholder="Mobile number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
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
                <Label>Type of Investment</Label>
                <Select
                  value={formData.investmentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, investmentType: value })
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="franchise">Franchise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Investment Range</Label>
                <Select
                  value={formData.investmentRange}
                  onValueChange={(value) =>
                    setFormData({ ...formData, investmentRange: value })
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select investment range">
                      {getSelectedInvestmentRangeLabel(
                        formData.investmentRange,
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {investmentRangeOptions.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2">
                      progress_activity
                    </span>
                    Sending OTP...
                  </>
                ) : (
                  "Get OTP & Continue"
                )}
              </Button>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 mt-4"
            >
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code sent to{" "}
                  <span className="text-foreground font-medium">
                    {formData.email}
                  </span>
                </p>

                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup className="justify-center">
                    <InputOTPSlot
                      index={0}
                      className="h-9 w-9 sm:h-10 sm:w-10"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-9 w-9 sm:h-10 sm:w-10"
                    />
                    <InputOTPSlot
                      index={2}
                      className="h-9 w-9 sm:h-10 sm:w-10"
                    />
                    <InputOTPSlot
                      index={3}
                      className="h-9 w-9 sm:h-10 sm:w-10"
                    />
                    <InputOTPSlot
                      index={4}
                      className="h-9 w-9 sm:h-10 sm:w-10"
                    />
                    <InputOTPSlot
                      index={5}
                      className="h-9 w-9 sm:h-10 sm:w-10"
                    />
                  </InputOTPGroup>
                </InputOTP>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-primary hover:underline"
                >
                  Didn't receive the code? Resend
                </button>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:flex-1"
                  onClick={() => setStep("form")}
                >
                  Back
                </Button>
                <Button
                  className="w-full sm:flex-1"
                  onClick={handleOtpVerify}
                  disabled={isSubmitting || otp.length < 6}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin mr-2">
                        progress_activity
                      </span>
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">
                  check_circle
                </span>
              </div>
              <p className="text-center text-muted-foreground">
                Redirecting you to the project details...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
