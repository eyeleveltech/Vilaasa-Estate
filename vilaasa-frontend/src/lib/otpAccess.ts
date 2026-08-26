import api from "@/api/axios";

const OTP_ACCESS_STORAGE_KEY = "vilaasa-otp-access";
const LEAD_PROFILE_STORAGE_KEY = "vilaasa-lead-profile";

// ⏱️ Exactly 2 Hours Session Window
const OTP_ACCESS_TTL_MS = 2 * 60 * 60 * 1000; 

export type LeadProfile = {
  name?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  updatedAt?: string;
};

type OtpAccessPayload = {
  verifiedAt: number;
};

/**
 * Marks OTP as verified and starts the 2-hour session
 */
export const markOtpVerified = () => {
  if (typeof window === "undefined") return;

  const payload: OtpAccessPayload = { verifiedAt: Date.now() };
  localStorage.setItem(OTP_ACCESS_STORAGE_KEY, JSON.stringify(payload));
};

/**
 * Checks if the user has an active, valid OTP session (< 2 hours old)
 */
export const isOtpVerified = (): boolean => {
  if (typeof window === "undefined") return false;

  const raw = localStorage.getItem(OTP_ACCESS_STORAGE_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as Partial<OtpAccessPayload>;
    const verifiedAt = Number(parsed.verifiedAt);

    if (!Number.isFinite(verifiedAt)) return false;

    const isValid = Date.now() - verifiedAt <= OTP_ACCESS_TTL_MS;
    if (!isValid) {
      localStorage.removeItem(OTP_ACCESS_STORAGE_KEY); // Expired
    }
    return isValid;
  } catch {
    return false;
  }
};

/**
 * Returns remaining session time in milliseconds (or 0 if expired)
 */
export const getOtpSessionRemainingMs = (): number => {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(OTP_ACCESS_STORAGE_KEY);
  if (!raw) return 0;

  try {
    const parsed = JSON.parse(raw) as Partial<OtpAccessPayload>;
    const verifiedAt = Number(parsed.verifiedAt);
    if (!Number.isFinite(verifiedAt)) return 0;
    const remaining = OTP_ACCESS_TTL_MS - (Date.now() - verifiedAt);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
};

/**
 * Retrieves the cached lead profile from localStorage
 */
export const getSavedLeadProfile = (): LeadProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEAD_PROFILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LeadProfile) : null;
  } catch {
    return null;
  }
};

/**
 * Clears the verification cache (logout)
 */
export const clearOtpVerification = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OTP_ACCESS_STORAGE_KEY);
};

/**
 * Silent, non-blocking background tracker for viewed properties
 */
export const trackSilentPropertyView = async (propertyId: string, propertyName?: string) => {
  if (!isOtpVerified()) return;

  const lead = getSavedLeadProfile();
  if (!lead?.email) return;

  try {
    // Non-blocking fire-and-forget
    void api.post("/inquiries/track-view", {
      propertyId,
      propertyName,
      email: lead.email,
      phone: lead.phone ? `${lead.phoneCountryCode || "+91"} ${lead.phone}`.trim() : undefined,
      name: lead.name,
    });
  } catch (error) {
    // Fail silently in background without disrupting the user
    console.debug("Silent view tracking notice:", error);
  }
};
