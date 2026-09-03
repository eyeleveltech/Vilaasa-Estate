/**
 * Creates (or resets) the SUPER_ADMIN account.
 *
 * This exists because prisma/seed.ts must never run against production: it
 * deletes every row in all 24 tables. This script only touches one user row,
 * so it is safe to run against a live database.
 *
 * Usage, from the repository root on the VPS:
 *
 *   docker compose exec \
 *     -e ADMIN_LOGIN_EMAIL=admin@vilaasaestates.com \
 *     -e ADMIN_LOGIN_PASSWORD='<a-strong-password>' \
 *     backend node scripts/create-admin.js
 *
 * Credentials are passed as environment variables rather than arguments so
 * they do not linger in shell history or show up in `ps`.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const email = (process.env.ADMIN_LOGIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_LOGIN_PASSWORD || "";
const name = (process.env.ADMIN_LOGIN_NAME || "Super Admin").trim();

async function main() {
  if (!email || !password) {
    throw new Error(
      "ADMIN_LOGIN_EMAIL and ADMIN_LOGIN_PASSWORD must both be set.",
    );
  }

  if (password.length < 12) {
    throw new Error(
      `ADMIN_LOGIN_PASSWORD must be at least 12 characters (received ${password.length}).`,
    );
  }

  const prisma = new PrismaClient();

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    // Upsert so re-running this is a password reset rather than an error.
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "SUPER_ADMIN", isActive: true },
      create: {
        email,
        passwordHash,
        name,
        role: "SUPER_ADMIN",
        isActive: true,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    console.log(`Super admin ready: ${user.email} (${user.role})`);
    console.log("Sign in at https://www.vilaasaestates.com/admin/login");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to create super admin:", error.message);
  process.exit(1);
});
