import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 12);

  // 1. create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@school.com" },
    update: {},
    create: {
      email: "superadmin@school.com",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log("✅ Super Admin Created:", superAdmin.email);
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
