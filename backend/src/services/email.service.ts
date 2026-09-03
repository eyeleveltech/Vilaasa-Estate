import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const getFrontendUrl = (): string => {
  return (
    process.env.FRONTEND_URL ||
    process.env.APP_URL ||
    "http://localhost:8080"
  ).replace(/\/$/, "");
};

/**
 * Transporter singleton for SMTP email delivery
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (
    !host ||
    !user ||
    !pass ||
    user.includes("your_") ||
    pass.includes("your_")
  ) {
    return null; // Development mock mode
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Base luxury email wrapper template matching public Vilaasa aesthetic
 */
const wrapInLuxuryTemplate = (title: string, bodyContent: string): string => {
  const frontendUrl = getFrontendUrl();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #e4e4e7; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #050505; padding: 32px 16px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #0d0d0f; border: 1px solid #222226; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(180deg, #131316 0%, #0d0d0f 100%); padding: 28px 24px; text-align: center; border-bottom: 1px solid #1f1f24; }
    .logo-img { height: 32px; width: auto; max-width: 220px; display: block; margin: 0 auto; border: 0; }
    .content { padding: 32px 28px; line-height: 1.65; font-size: 14px; color: #d4d4d8; }
    .gold-box { background: linear-gradient(135deg, rgba(77,185,96,0.06) 0%, rgba(212,175,55,0.04) 100%); border: 1px solid rgba(77,185,96,0.25); border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #4db960; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 10px 0; text-align: center; }
    .btn { display: inline-block; background-color: #4db960; color: #000000 !important; font-weight: 700; padding: 13px 30px; border-radius: 6px; text-decoration: none; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; margin: 16px 0 8px; }
    .btn-secondary { display: inline-block; background-color: transparent; border: 1px solid #3f3f46; color: #e4e4e7 !important; font-weight: 600; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-size: 11px; margin-top: 10px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #141417; border-radius: 8px; overflow: hidden; border: 1px solid #27272a; }
    .info-table td { padding: 12px 16px; border-bottom: 1px solid #1f1f23; font-size: 13px; }
    .info-table td:first-child { color: #71717a; width: 35%; font-weight: 500; }
    .info-table td:last-child { color: #f4f4f5; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${frontendUrl}" style="text-decoration: none; display: inline-block;">
          <img src="https://res.cloudinary.com/xlrhxut7/image/upload/f_png,w_500/v1787653922/vilaasa/branding/vilaasa-logo-white.svg" alt="VILAASA ESTATES" class="logo-img" />
        </a>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generic email dispatcher with development mock fallback
 */
export const sendEmail = async (
  options: SendEmailOptions,
): Promise<{ success: boolean; messageId?: string }> => {
  const fromName = process.env.FROM_NAME || "Vilaasa Estates Concierge";
  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.FROM_EMAIL ||
    "concierge@vilaasaestates.com";
  const transporter = createTransporter();

  if (!transporter) {
    console.log(
      `\n📧 [DEV EMAIL SERVICE] Sending to: ${options.to} | Subject: "${options.subject}"`,
    );
    console.log(`------------------------------------------------------------`);
    if (options.text) {
      console.log(options.text);
    }
    console.log(`------------------------------------------------------------\n`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM
        ? process.env.SMTP_FROM
        : `"${fromName}" <${fromAddress}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email Delivery Error:", error);
    return { success: false };
  }
};

/**
 * Sends OTP Code Email
 */
export const sendOtpEmail = async (
  email: string,
  otp: string,
): Promise<{ success: boolean }> => {
  const frontendUrl = getFrontendUrl();

  const body = `
    <h2 style="color: #ffffff; font-size: 19px; font-weight: 400; margin-top: 0;">Email Verification</h2>
    <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">Here is your one-time password (OTP) to verify your email address for property viewing:</p>
    
    <div class="gold-box">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #71717a; margin-bottom: 4px;">Verification Code</div>
      <div class="otp-code" style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #4db960; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 10px 0; text-align: center;"><strong>${otp}</strong></div>
      <p style="font-size: 11px; color: #71717a; margin: 8px 0 0 0;">Expires in 10 minutes.</p>
    </div>

    <p style="font-size: 12px; color: #71717a; margin-top: 24px; margin-bottom: 0;">If you did not request this code, no action is needed.</p>
  `;

  const html = wrapInLuxuryTemplate("Email Verification - Vilaasa Estates", body);
  const text = `${otp} is your Vilaasa Estates verification code for property viewing. Valid for 10 minutes.`;

  return sendEmail({
    to: email,
    subject: `${otp} is your Vilaasa Estates verification code`,
    html,
    text,
  });
};

/**
 * Sends New Lead / Inquiry Confirmation Email
 */
export const sendInquiryConfirmationEmail = async (inquiry: {
  name: string;
  email: string;
  investmentType: string;
  investmentRange: string;
  propertyName?: string;
  propertySlug?: string;
}): Promise<{ success: boolean }> => {
  const frontendUrl = getFrontendUrl();
  const propertyUrl = inquiry.propertySlug
    ? `${frontendUrl}/properties/${inquiry.propertySlug}`
    : `${frontendUrl}/properties`;

  const body = `
    <h2 style="color: #ffffff; font-size: 19px; font-weight: 400; margin-top: 0;">Bespoke Advisory Request Received</h2>
    <p>Dear ${inquiry.name},</p>
    <p>Thank you for expressing interest in <strong>${inquiry.propertyName || "Vilaasa Luxury Portfolio"}</strong>.</p>
    
    <table class="info-table">
      <tr>
        <td>Asset Portfolio</td>
        <td>${inquiry.investmentType.replace(/_/g, " ").toUpperCase()}</td>
      </tr>
      <tr>
        <td>Target Capital</td>
        <td>${inquiry.investmentRange}</td>
      </tr>
      <tr>
        <td>Assigned Desk</td>
        <td>Private Client Advisory — Senior Partner</td>
      </tr>
    </table>

    <p>Our Private Client Desk has assigned a Senior Portfolio Director to your dossier. We will contact you via discreet phone or secure email within 2 business hours with full architectural dossiers and financial models.</p>
    
    <div style="text-align: center; margin: 28px 0 12px;">
      <a href="${propertyUrl}" class="btn">Explore Property Dossier</a>
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #a1a1aa;">With distinguished regards,<br><strong style="color: #4db960;">Vilaasa Estates Private Client Desk</strong></p>
  `;

  const html = wrapInLuxuryTemplate("Inquiry Received - Vilaasa Estates", body);

  return sendEmail({
    to: inquiry.email,
    subject: `Portfolio Dossier Request: ${inquiry.propertyName || "Vilaasa Estates"}`,
    html,
    text: `Dear ${inquiry.name}, thank you for your interest in Vilaasa Estates. A Senior Portfolio Partner will contact you shortly. View at ${propertyUrl}`,
  });
};

/**
 * Sends Channel Partner Registration Acknowledgement Email
 */
export const sendPartnerRegistrationEmail = async (partner: {
  name: string;
  email: string;
  company?: string;
}): Promise<{ success: boolean }> => {
  const frontendUrl = getFrontendUrl();

  const body = `
    <h2 style="color: #ffffff; font-size: 19px; font-weight: 400; margin-top: 0;">Channel Partner Application Received</h2>
    <p>Dear ${partner.name},</p>
    <p>Thank you for applying to join the <strong>Vilaasa Channel Partner Network</strong>${partner.company ? ` representing <strong>${partner.company}</strong>` : ""}.</p>
    
    <div class="gold-box">
      <div style="font-size: 12px; font-weight: 600; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Status: Under Institutional Review</div>
      <p style="font-size: 12px; color: #a1a1aa; margin: 8px 0 0;">Turnaround: 24 to 48 hours for compliance &amp; RERA verification.</p>
    </div>

    <p>Upon institutional approval, you will receive an official invitation with access credentials to the Partner Portal featuring real-time commission tracking, exclusive off-market inventory blocks, and client registration tools.</p>

    <div style="text-align: center; margin: 24px 0 8px;">
      <a href="${frontendUrl}/properties" class="btn">Browse Available Inventory</a>
    </div>
  `;

  const html = wrapInLuxuryTemplate(
    "Channel Partner Application - Vilaasa Estates",
    body,
  );

  return sendEmail({
    to: partner.email,
    subject: `Channel Partner Application Received — Vilaasa Estates`,
    html,
    text: `Dear ${partner.name}, your application to the Vilaasa Channel Partner Network has been received and is under review. Portal: ${frontendUrl}`,
  });
};

/**
 * Sends Channel Partner Approval Email
 */
export const sendPartnerApprovedEmail = async (partner: {
  name: string;
  email: string;
  portalUrl?: string;
}): Promise<{ success: boolean }> => {
  const frontendUrl = getFrontendUrl();
  const portalUrl = partner.portalUrl || `${frontendUrl}/partner/login`;

  const body = `
    <h2 style="color: #4db960; font-size: 20px; font-weight: 400; margin-top: 0;">Institutional Partnership Approved</h2>
    <p>Dear ${partner.name},</p>
    <p>We are delighted to confirm that your application to the <strong>Vilaasa Channel Partner Network</strong> has been approved by the Executive Committee.</p>
    
    <div class="gold-box">
      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Access Your Partner Portal</p>
      <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 16px;">Log in to access client registration, off-market inventory, and commission tracking.</p>
      <a href="${portalUrl}" class="btn">Log In to Partner Portal</a>
    </div>

    <p>You can now register prospective VIP buyers, request off-market inventory blocks, and track commission disbursements directly through the encrypted portal.</p>
  `;

  const html = wrapInLuxuryTemplate(
    "Partnership Approved - Vilaasa Estates",
    body,
  );

  return sendEmail({
    to: partner.email,
    subject: `Welcome to the Vilaasa Channel Partner Network — Approved`,
    html,
    text: `Congratulations ${partner.name}, your Vilaasa Channel Partner registration is approved. Log in at: ${portalUrl}`,
  });
};

/**
 * Sends Site Visit Booking Confirmation Email
 */
export const sendSiteVisitConfirmationEmail = async (visit: {
  name: string;
  email: string;
  propertyName: string;
  propertySlug?: string;
  scheduledDate: string;
  scheduledTime: string;
}): Promise<{ success: boolean }> => {
  const frontendUrl = getFrontendUrl();
  const propertyUrl = visit.propertySlug
    ? `${frontendUrl}/properties/${visit.propertySlug}`
    : `${frontendUrl}/properties`;

  const body = `
    <h2 style="color: #ffffff; font-size: 19px; font-weight: 400; margin-top: 0;">Private Estate Site Visit Confirmed</h2>
    <p>Dear ${visit.name},</p>
    <p>Your private on-site inspection for <strong>${visit.propertyName}</strong> has been confirmed.</p>
    
    <table class="info-table">
      <tr>
        <td>Estate</td>
        <td>${visit.propertyName}</td>
      </tr>
      <tr>
        <td>Date</td>
        <td>${visit.scheduledDate}</td>
      </tr>
      <tr>
        <td>Time Slot</td>
        <td>${visit.scheduledTime}</td>
      </tr>
      <tr>
        <td>Reception</td>
        <td>VIP Chauffeur &amp; Ambassador Gate</td>
      </tr>
    </table>

    <p>A designated Estate Ambassador will greet you at the main gate reception with a personalized property dossier and private architectural walkthrough.</p>

    <div style="text-align: center; margin: 28px 0 12px;">
      <a href="${propertyUrl}" class="btn">View Property Dossier</a>
    </div>
  `;

  const html = wrapInLuxuryTemplate(
    "Site Visit Itinerary - Vilaasa Estates",
    body,
  );

  return sendEmail({
    to: visit.email,
    subject: `Confirmed: Private Inspection of ${visit.propertyName}`,
    html,
    text: `Dear ${visit.name}, your site visit for ${visit.propertyName} on ${visit.scheduledDate} at ${visit.scheduledTime} is confirmed. View details at: ${propertyUrl}`,
  });
};

/**
 * Sends Vault Client / Investor Onboarding Welcome & Credentials Email
 */
export const sendVaultOnboardingEmail = async (investor: {
  name: string;
  email: string;
  password?: string;
  portalUrl?: string;
}): Promise<{ success: boolean }> => {
  const frontendUrl = getFrontendUrl();
  const portalUrl = investor.portalUrl || `${frontendUrl}/vault/login`;

  const body = `
    <h2 style="color: #4db960; font-size: 20px; font-weight: 400; margin-top: 0;">Welcome to The Private Vault</h2>
    <p>Dear ${investor.name},</p>
    <p>We are privileged to welcome you to <strong>The Private Vault at Vilaasa Estates</strong>. Your exclusive private client portal has been provisioned to provide confidential, real-time oversight of your luxury estate portfolio, rental yields, asset valuations, and construction milestones.</p>
    
    <div class="gold-box" style="text-align: left; background: #141417; border: 1px solid #27272a; padding: 20px 24px; border-radius: 8px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #4db960; font-weight: 700; margin-bottom: 12px;">Confidential Access Credentials</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #71717a; width: 35%;">Vault Portal:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 600;"><a href="${portalUrl}" style="color: #4db960; text-decoration: none;">${portalUrl}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717a;">Username / Email:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 600; font-family: monospace;">${investor.email}</td>
        </tr>
        ${
          investor.password
            ? `<tr>
          <td style="padding: 6px 0; color: #71717a;">Temporary Key:</td>
          <td style="padding: 6px 0; color: #4db960; font-weight: 700; font-family: monospace; font-size: 14px;">${investor.password}</td>
        </tr>`
            : ""
        }
      </table>
    </div>

    <div style="text-align: center; margin: 28px 0 16px;">
      <a href="${portalUrl}" class="btn" style="padding: 14px 36px; font-size: 12px;">Access The Vault Portal</a>
    </div>

    <p style="font-size: 12px; color: #71717a; margin-top: 24px; line-height: 1.6;">
      <strong>Security Advisory:</strong> For your protection, your access key is strictly confidential. We advise updating your security credentials upon initial login. If you require private advisory or tailored assistance, please contact your dedicated Wealth Advisor.
    </p>

    <p style="margin-top: 20px; font-size: 13px; color: #a1a1aa;">
      With highest consideration,<br>
      <strong style="color: #4db960;">The Private Vault Concierge</strong><br>
      <span style="font-size: 11px; color: #71717a;">Vilaasa Estates Private Client Advisory</span>
    </p>
  `;

  const html = wrapInLuxuryTemplate(
    "Your Vault Access Credentials — Vilaasa Estates",
    body,
  );

  return sendEmail({
    to: investor.email,
    subject: `Your Private Vault Credentials & Dossier — Vilaasa Estates`,
    html,
    text: `Dear ${investor.name}, your Private Vault account at Vilaasa Estates is now active. Access URL: ${portalUrl} | Email: ${investor.email} ${investor.password ? `| Temporary Password: ${investor.password}` : ""}`,
  });
};

/**
 * Sends Channel Partner Onboarding Welcome & Credentials Email
 */
export const sendPartnerOnboardingEmail = async (partner: {
  name: string;
  email: string;
  password?: string;
  company?: string;
  portalUrl?: string;
}): Promise<{ success: boolean }> => {
  const frontendUrl = getFrontendUrl();
  const portalUrl = partner.portalUrl || `${frontendUrl}/partner/login`;

  const body = `
    <h2 style="color: #4db960; font-size: 20px; font-weight: 400; margin-top: 0;">Welcome to the Vilaasa Partner Network</h2>
    <p>Dear ${partner.name},</p>
    <p>We are pleased to confirm that your institutional partner profile has been provisioned on the <strong>Vilaasa Estates Channel Partner Network</strong>${partner.company ? ` representing <strong>${partner.company}</strong>` : ""}.</p>
    
    <div class="gold-box" style="text-align: left; background: #141417; border: 1px solid #27272a; padding: 20px 24px; border-radius: 8px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #4db960; font-weight: 700; margin-bottom: 12px;">Partner Access Credentials</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #71717a; width: 35%;">Partner Portal:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 600;"><a href="${portalUrl}" style="color: #4db960; text-decoration: none;">${portalUrl}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717a;">Login Username:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 600; font-family: monospace;">${partner.email}</td>
        </tr>
        ${
          partner.password
            ? `<tr>
          <td style="padding: 6px 0; color: #71717a;">Temporary Key:</td>
          <td style="padding: 6px 0; color: #4db960; font-weight: 700; font-family: monospace; font-size: 14px;">${partner.password}</td>
        </tr>`
            : ""
        }
      </table>
    </div>

    <div style="text-align: center; margin: 28px 0 16px;">
      <a href="${portalUrl}" class="btn" style="padding: 14px 36px; font-size: 12px;">Access Partner Portal</a>
    </div>

    <p style="font-size: 12px; color: #71717a; margin-top: 24px; line-height: 1.6;">
      <strong>Security Advisory:</strong> Please keep these credentials confidential. You can update your access password in your partner settings upon logging in. Through this portal, you can register prospective VIP clients, request off-market inventory blocks, and track commission settlements in real time.
    </p>

    <p style="margin-top: 20px; font-size: 13px; color: #a1a1aa;">
      With highest consideration,<br>
      <strong style="color: #4db960;">Institutional Partnership Desk</strong><br>
      <span style="font-size: 11px; color: #71717a;">Vilaasa Estates Institutional Advisory</span>
    </p>
  `;

  const html = wrapInLuxuryTemplate(
    "Your Partner Portal Credentials — Vilaasa Estates",
    body,
  );

  return sendEmail({
    to: partner.email,
    subject: `Your Channel Partner Credentials & Portal Access — Vilaasa Estates`,
    html,
    text: `Dear ${partner.name}, your Channel Partner account at Vilaasa Estates is active. Access URL: ${portalUrl} | Username: ${partner.email} ${partner.password ? `| Temporary Password: ${partner.password}` : ""}`,
  });
};

