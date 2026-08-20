const OTP_ACCESS_STORAGE_KEY = "vilaasa-otp-access";
const OTP_ACCESS_TTL_MS = 1000 * 60 * 60 * 24 * 30;

type OtpAccessPayload = {
  verifiedAt: number;
};

export const markOtpVerified = () => {
  if (typeof window === "undefined") return;

  const payload: OtpAccessPayload = { verifiedAt: Date.now() };
  localStorage.setItem(OTP_ACCESS_STORAGE_KEY, JSON.stringify(payload));
};

export const isOtpVerified = () => {
  if (typeof window === "undefined") return false;

  const raw = localStorage.getItem(OTP_ACCESS_STORAGE_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as Partial<OtpAccessPayload>;
    const verifiedAt = Number(parsed.verifiedAt);

    if (!Number.isFinite(verifiedAt)) return false;

    const isValid = Date.now() - verifiedAt <= OTP_ACCESS_TTL_MS;
    if (!isValid) localStorage.removeItem(OTP_ACCESS_STORAGE_KEY);
    return isValid;
  } catch {
    return false;
  }
};

export const clearOtpVerification = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OTP_ACCESS_STORAGE_KEY);
};
