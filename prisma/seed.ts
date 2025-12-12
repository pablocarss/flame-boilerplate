import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create Plans
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { slug: "free" },
      update: {},
      create: {
        name: "Free",
        slug: "free",
        description: "Para começar sua jornada",
        price: 0,
        currency: "BRL",
        interval: "month",
        features: [
          "1 usuário",
          "100MB de armazenamento",
          "Suporte por email",
          "Funcionalidades básicas",
        ],
        maxMembers: 1,
        maxStorage: 100,
        sortOrder: 0,
      },
    }),
    prisma.plan.upsert({
      where: { slug: "pro" },
      update: {},
      create: {
        name: "Pro",
        slug: "pro",
        description: "Para equipes em crescimento",
        price: 49.9,
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
    }),
    prisma.plan.upsert({
      where: { slug: "enterprise" },
      update: {},
      create: {
        name: "Enterprise",
        slug: "enterprise",
        description: "Para grandes organizações",
        price: 199.9,
        currency: "BRL",
        interval: "month",
        features: [
          "Usuários ilimitados",
          "Armazenamento ilimitado",
          "Suporte 24/7",
          "Todas as funcionalidades",
          "Relatórios customizados",
          "API access",
          "SSO/SAML",
          "SLA garantido",
        ],
        maxMembers: -1, // unlimited
        maxStorage: -1, // unlimited
        sortOrder: 2,
      },
    }),
  ]);

  console.log("✅ Plans created:", plans.map((p) => p.name).join(", "));

  // Create demo user and organization
  const hashedPassword = await bcrypt.hash("demo123456", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@flame.dev" },
    update: {},
    create: {
      email: "demo@flame.dev",
      name: "Demo User",
      password: hashedPassword,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log("✅ Demo user created:", demoUser.email);

  // Create demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { slug: "demo-org" },
    update: {},
    create: {
      name: "Demo Organization",
      slug: "demo-org",
    },
  });

  console.log("✅ Demo organization created:", demoOrg.name);

  // Add demo user as admin of demo org
  await prisma.member.upsert({
    where: {
      userId_organizationId: {
        userId: demoUser.id,
        organizationId: demoOrg.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      organizationId: demoOrg.id,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Demo user added as admin to organization");

  // Create subscription for demo org (Free plan)
  const freePlan = plans.find((p) => p.slug === "free")!;
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { organizationId: demoOrg.id },
    update: {},
    create: {
      organizationId: demoOrg.id,
      planId: freePlan.id,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  console.log("✅ Subscription created for demo organization");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📧 Demo credentials:");
  console.log("   Email: demo@flame.dev");
  console.log("   Password: demo123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
