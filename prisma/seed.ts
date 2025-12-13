import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create only Pro Plan
  const proPlan = await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {
      price: 52.0,
    },
    create: {
      name: "Pro",
      slug: "pro",
      description: "Para equipes em crescimento",
      price: 52.0,
      currency: "BRL",
      interval: "month",
      features: [
        "Até 10 usuários",
        "10GB de armazenamento",
        "Suporte prioritário",
        "Todas as funcionalidades",
        "Relatórios avançados",
        "API access",
      ],
      maxMembers: 10,
      maxStorage: 10240,
      sortOrder: 1,
    },
  });

  console.log("✅ Plan created:", proPlan.name);

  // Create admin user only
  const hashedPassword = await bcrypt.hash("admin", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      name: "Admin",
      password: hashedPassword,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log("✅ Admin user created:", adminUser.email);

  // Create admin organization
  const adminOrg = await prisma.organization.upsert({
    where: { slug: "admin-org" },
    update: {},
    create: {
      name: "Admin Organization",
      slug: "admin-org",
    },
  });

  console.log("✅ Admin organization created:", adminOrg.name);

  // Add admin user as admin of admin org
  await prisma.member.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: adminOrg.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      organizationId: adminOrg.id,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Admin user added as admin to organization");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📧 Admin credentials:");
  console.log("   Email: admin@gmail.com");
  console.log("   Password: admin");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
