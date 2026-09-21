import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@school.com";
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123456";

  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  // Create or Update Super Admin Account
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isApproved: true
    },
    create: {
      email: superAdminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isApproved: true
    },
  });

  console.log("✅ Super Admin Account Initialized Successfully!");
  console.log("-----------------------------------------------");
  console.log(`📧 Email:    ${superAdmin.email}`);
  console.log(`🔑 Role:     ${superAdmin.role}`);
  console.log("-----------------------------------------------");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });