import "dotenv/config";

/**
 * Centralised, fail-fast environment configuration.
 *
 * Secrets are NEVER given an inline fallback: a missing or weak secret must
 * stop the process at boot rather than silently downgrade authentication or
 * quietly reach for someone else's cloud account. Every problem found is
 * collected first so a misconfigured deployment reports all of them at once.
 */

interface EnvIssue {
  key: string;
  problem: string;
}

const issues: EnvIssue[] = [];

const NODE_ENV = process.env.NODE_ENV?.trim() || "development";
const IS_PRODUCTION = NODE_ENV === "production";

const read = (key: string): string => process.env[key]?.trim() || "";

/** A variable the application cannot run without, in any environment. */
const required = (key: string, minLength = 0): string => {
  const value = read(key);

  if (!value) {
    issues.push({ key, problem: "is missing" });
    return "";
  }

  if (minLength && value.length < minLength) {
    issues.push({
      key,
      problem: `must be at least ${minLength} characters (received ${value.length})`,
    });
  }

  return value;
};

/**
 * A variable required in production only. Left blank elsewhere so local
 * development can run without third-party credentials; the feature that needs
 * it is responsible for failing clearly when it is actually used.
 */
const requiredInProduction = (key: string): string => {
  const value = read(key);

  if (!value && IS_PRODUCTION) {
    issues.push({ key, problem: "is missing" });
  }

  return value;
};

export const env = {
  NODE_ENV,
  IS_PRODUCTION,
  PORT: parseInt(read("PORT") || "5000", 10),

  DATABASE_URL: required("DATABASE_URL"),

  JWT_SECRET: required("JWT_SECRET", 32),
  JWT_EXPIRES_IN: read("JWT_EXPIRES_IN") || "7d",

  CLOUDINARY_CLOUD_NAME: requiredInProduction("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: requiredInProduction("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: requiredInProduction("CLOUDINARY_API_SECRET"),
} as const;

if (issues.length > 0) {
  const details = issues
    .map(({ key, problem }) => `  - ${key} ${problem}`)
    .join("\n");

  throw new Error(
    `Invalid environment configuration (NODE_ENV=${NODE_ENV}):\n${details}\n\n` +
      `Copy backend/.env.example to backend/.env and fill in ` +
      `the values above, or set them in your deployment environment.`,
  );
}

/** True when Cloudinary is configured well enough to attempt an upload. */
export const isCloudinaryConfigured = (): boolean =>
  Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET,
  );
