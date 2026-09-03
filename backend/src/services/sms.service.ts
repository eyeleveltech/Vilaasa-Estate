import twilio from "twilio";

export interface SendSmsOptions {
  to: string;
  message: string;
}

/**
 * Sanitizes and normalizes phone number to E.164 international standard format
 * e.g. "+91 98765 43210" -> "+919876543210"
 * "9876543210" -> "+919876543210" (defaults to India +91 if country code missing)
 */
export const normalizePhoneNumber = (phone: string, defaultCountryCode = "+91"): string => {
  if (!phone) return "";

  // Remove spaces, hyphens, brackets, dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, "").trim();

  // If already starts with '+', return clean format
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If starts with '00', replace with '+'
  if (cleaned.startsWith("00")) {
    return "+" + cleaned.slice(2);
  }

  // If 10 digits without prefix, prepend defaultCountryCode
  if (/^\d{10}$/.test(cleaned)) {
    const code = defaultCountryCode.startsWith("+") ? defaultCountryCode : `+${defaultCountryCode}`;
    return `${code}${cleaned}`;
  }

  // Fallback: prepend '+'
  return `+${cleaned}`;
};

/**
 * Initializes Twilio client singleton or activates safe development mock mode
 */
const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const verifyServiceSid =
    process.env.TWILIO_VERIFY_SERVICE_SID ||
    process.env.TWILIO_SERVICE_SID;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (
    !accountSid ||
    !authToken ||
    accountSid.includes("your_") ||
    authToken.includes("your_")
  ) {
    return null; // Development mock mode
  }

  try {
    const client = twilio(accountSid, authToken);
    return { client, verifyServiceSid, messagingServiceSid, fromNumber };
  } catch (error) {
    console.error("❌ Failed to initialize Twilio client:", error);
    return null;
  }
};

/**
 * Formats custom OTP SMS message body
 */
export const formatCustomOtpMessage = (otp: string, propertyName?: string): string => {
  const template = process.env.TWILIO_SMS_TEMPLATE;
  if (template && template.includes("{OTP}")) {
    return template
      .replace(/\{OTP\}/g, otp)
      .replace(/\{PROPERTY\}/g, propertyName || "Luxury Asset");
  }

  if (propertyName) {
    return `Welcome to Vilaasa Estates. Your private verification code for ${propertyName} is: ${otp}. Valid for 10 minutes.`;
  }

  return `Welcome to Vilaasa Estates. Your private verification code is: ${otp}. Valid for 10 minutes. Please do not share this code.`;
};

/**
 * Dispatches 6-digit OTP verification code via Twilio Programmable SMS or Verify API
 */
export const sendOtpSms = async (
  phone: string,
  otp: string,
  propertyName?: string,
): Promise<{ success: boolean; messageId?: string; error?: string; provider?: string }> => {
  const formattedTo = normalizePhoneNumber(phone);
  const twilioConfig = createTwilioClient();
  const customMessage = formatCustomOtpMessage(otp, propertyName);

  // 1. Safe Development Mock Fallback
  if (!twilioConfig) {
    console.log(`\n📱 [DEV SMS SERVICE] Sending to: ${formattedTo}`);
    console.log(`------------------------------------------------------------`);
    console.log(customMessage);
    console.log(`------------------------------------------------------------\n`);
    return { success: true, messageId: `mock-sms-${Date.now()}`, provider: "mock" };
  }

  const { client, verifyServiceSid, messagingServiceSid, fromNumber } = twilioConfig;

  // 1. Direct Programmable SMS via Twilio Phone Number (Primary & Most Reliable)
  if (fromNumber && !fromNumber.includes("your_")) {
    try {
      const response = await client.messages.create({
        body: customMessage,
        from: fromNumber,
        to: formattedTo,
      });

      console.log(`✅ [TWILIO SMS] Sent to ${formattedTo} from ${fromNumber} (SID: ${response.sid})`);
      return {
        success: true,
        messageId: response.sid,
        provider: "twilio_sms",
      };
    } catch (error: any) {
      console.error("❌ Twilio Phone SMS Delivery Error:", error?.message || error);
      return {
        success: false,
        error: error?.message || "Failed to dispatch custom SMS through Twilio phone number",
      };
    }
  }

  // 2. Custom Programmable SMS via Messaging Service (Starts with MG...)
  if (messagingServiceSid && !messagingServiceSid.includes("your_")) {
    try {
      const response = await client.messages.create({
        body: customMessage,
        messagingServiceSid,
        to: formattedTo,
      });

      console.log(`✅ [TWILIO MESSAGING SERVICE] Sent to ${formattedTo} (SID: ${response.sid})`);
      return {
        success: true,
        messageId: response.sid,
        provider: "twilio_messaging_service",
      };
    } catch (error: any) {
      console.error("❌ Twilio Messaging Service Error:", error?.message || error);
      return {
        success: false,
        error: error?.message || "Failed to dispatch custom SMS through Messaging Service",
      };
    }
  }

  // 3. Fallback to Twilio Verify Service (If no custom sender configured)
  if (verifyServiceSid && !verifyServiceSid.includes("your_")) {
    try {
      const verification = await client.verify.v2
        .services(verifyServiceSid)
        .verifications.create({
          to: formattedTo,
          channel: "sms",
        });

      console.log(`✅ [TWILIO VERIFY] Verification sent to ${formattedTo} (SID: ${verification.sid})`);
      return {
        success: true,
        messageId: verification.sid,
        provider: "twilio_verify",
      };
    } catch (error: any) {
      console.error("❌ Twilio Verify Dispatch Error:", error?.message || error);
      return {
        success: false,
        error: error?.message || "Failed to dispatch verification code via Twilio Verify",
      };
    }
  }


  // Fallback to dev log
  console.log(`\n📱 [DEV SMS FALLBACK] Sending to: ${formattedTo} | Message: ${customMessage}\n`);
  return { success: true, messageId: `mock-sms-${Date.now()}`, provider: "mock" };
};

/**
 * Validates OTP code against Twilio Verify API (if Verify Service is configured and not using custom SMS)
 */
export const checkOtpWithTwilioVerify = async (
  phone: string,
  otp: string,
): Promise<boolean | null> => {
  const formattedTo = normalizePhoneNumber(phone);
  const twilioConfig = createTwilioClient();

  // If using custom SMS via Messaging Service or Phone Number, check local database
  if (twilioConfig?.messagingServiceSid || twilioConfig?.fromNumber) {
    return null; // Local database check
  }

  if (!twilioConfig || !twilioConfig.verifyServiceSid || twilioConfig.verifyServiceSid.includes("your_")) {
    return null; // Fall back to database verification
  }

  try {
    const check = await twilioConfig.client.verify.v2
      .services(twilioConfig.verifyServiceSid)
      .verificationChecks.create({
        to: formattedTo,
        code: otp,
      });

    return check.status === "approved";
  } catch (error: any) {
    console.error("❌ Twilio Verify Check Error:", error?.message || error);
    return null;
  }
};
