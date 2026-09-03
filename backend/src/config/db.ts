import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const isProduction = process.env.NODE_ENV === "production";

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: isProduction ? ["error", "warn"] : ["query", "info", "warn", "error"],
  });

if (!isProduction) {
  global.__prisma = prisma;
}

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log(" PostgreSQL Database connected successfully via Prisma.");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
};
