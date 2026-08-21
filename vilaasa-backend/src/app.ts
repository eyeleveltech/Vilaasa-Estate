import "dotenv/config";
import express, { Request, Response, Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";
import { ApiError } from "./utils/ApiError";
import { ApiResponse } from "./utils/ApiResponse";

// Module routes
import authRoutes from "./modules/auth/auth.routes";
import propertyRoutes from "./modules/property/property.routes";
import amenityRoutes from "./modules/amenity/amenity.routes";
import constructionRoutes from "./modules/construction/construction.routes";
import mediaRoutes from "./modules/media/media.routes";
import inquiryRoutes from "./modules/inquiry/inquiry.routes";
import channelPartnerRoutes from "./modules/channelPartner/channelPartner.routes";
import siteVisitRoutes from "./modules/siteVisit/siteVisit.routes";
import vaultRoutes from "./modules/vault/vault.routes";

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security & Header Middlewares
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:8080",
      "https://vilaasaestates.com",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow any localhost / 127.0.0.1 port or explicit allowed origins
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes("*")
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.options("*", cors());

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Request Body Parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Rate Limiting (100 requests per 15 minutes window)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
    errors: ["Rate limit exceeded"],
  },
});

app.use("/api/", apiLimiter);

// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get("/api/v1/health", (_req: Request, res: Response) => {
  return res.status(200).json(
    ApiResponse.ok(
      {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      },
      "Vilaasa Estates API is operating smoothly",
    ),
  );
});

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ----------------------------------------------------
// Mount Versioned API Routes (/api/v1)
// ----------------------------------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/amenities", amenityRoutes);
app.use("/api/v1/construction", constructionRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);
app.use("/api/v1/channel-partners", channelPartnerRoutes);
app.use("/api/v1/partners", channelPartnerRoutes);
app.use("/api/v1/site-visits", siteVisitRoutes);
app.use("/api/v1/vault", vaultRoutes);

// ----------------------------------------------------
// 404 Route Handler
// ----------------------------------------------------
app.use((req: Request, _res: Response, next) => {
  next(
    ApiError.notFound(
      `Cannot find endpoint '${req.method} ${req.originalUrl}' on Vilaasa API`,
    ),
  );
});

// ----------------------------------------------------
// Global Error Handler Middleware
// ----------------------------------------------------
app.use(errorHandler);

// ----------------------------------------------------
// Start Server
// ----------------------------------------------------
if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `🚀 Vilaasa Estates Backend listening on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
      );
      console.log(`📡 Health check available at: http://localhost:${PORT}/api/v1/health`);
    });
  };

  void startServer();
}

export default app;
