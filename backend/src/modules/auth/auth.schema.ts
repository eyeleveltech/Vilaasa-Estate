import { z } from "zod";
import { Role } from "@prisma/client";

export const RegisterSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters long")
    .trim(),
  phone: z.string().optional(),
  phoneCode: z.string().default("+91"),
  role: z.nativeEnum(Role).default(Role.CHANNEL_PARTNER),
  licenseNumber: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export const SendOtpSchema = z
  .object({
    channel: z.enum(["EMAIL", "SMS"]).default("SMS"),
    email: z
      .string()
      .email("Invalid email format")
      .toLowerCase()
      .trim()
      .optional(),
    phone: z.string().trim().optional(),
    phoneCode: z.string().trim().default("+91"),
    propertyName: z.string().trim().optional(),
  })

  .refine(
    (data) => {
      if (data.channel === "SMS") {
        return !!data.phone && data.phone.replace(/\D/g, "").length >= 6;
      }
      return !!data.email;
    },
    {
      message: "Phone number is required for SMS, and email is required for Email OTP",
      path: ["channel"],
    },
  );

export const VerifyOtpSchema = z
  .object({
    channel: z.enum(["EMAIL", "SMS"]).default("SMS"),
    email: z
      .string()
      .email("Invalid email format")
      .toLowerCase()
      .trim()
      .optional(),
    phone: z.string().trim().optional(),
    phoneCode: z.string().trim().default("+91"),
    otp: z
      .string({ required_error: "OTP is required" })
      .length(6, "OTP must be exactly 6 digits"),
  })
  .refine(
    (data) => {
      if (data.channel === "SMS") {
        return !!data.phone;
      }
      return !!data.email;
    },
    {
      message: "Phone is required to verify SMS OTP, and email is required for Email OTP",
      path: ["channel"],
    },
  );

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

