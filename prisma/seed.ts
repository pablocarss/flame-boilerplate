import { PrismaClient, Role, LeadStatus, LeadSource, SubmissionStatus } from "@prisma/client";
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

  // Create sample leads
  const sampleLeads = [
    {
      name: "João Silva",
      email: "joao.silva@empresa.com.br",
      phone: "+55 11 98765-4321",
      company: "Tech Solutions Ltda",
      position: "CTO",
      source: LeadSource.WEBSITE,
      status: LeadStatus.NEW,
      value: 15000,
      notes: "Interessado em migração para cloud",
      tags: ["cloud", "enterprise"],
    },
    {
      name: "Maria Santos",
      email: "maria.santos@startup.io",
      phone: "+55 21 91234-5678",
      company: "Startup Inovadora",
      position: "CEO",
      source: LeadSource.REFERRAL,
      status: LeadStatus.CONTACTED,
      value: 8500,
      notes: "Referência de cliente atual, muito engajada",
      tags: ["startup", "saas"],
    },
    {
      name: "Pedro Oliveira",
      email: "pedro@consultoria.com",
      company: "Consultoria Pro",
      position: "Diretor",
      source: LeadSource.SOCIAL_MEDIA,
      status: LeadStatus.QUALIFIED,
      value: 22000,
      notes: "Participou do webinar, pronto para proposta",
      tags: ["consulting", "high-value"],
    },
    {
      name: "Ana Costa",
      email: "ana.costa@tech.com.br",
      phone: "+55 11 99999-8888",
      company: "TechCorp Brasil",
      position: "Head de TI",
      source: LeadSource.EVENT,
      status: LeadStatus.PROPOSAL,
      value: 35000,
      notes: "Proposta enviada, aguardando aprovação do board",
      tags: ["enterprise", "strategic"],
    },
    {
      name: "Carlos Ferreira",
      email: "carlos@ecommerce.com",
      company: "E-Commerce Plus",
      position: "CMO",
      source: LeadSource.EMAIL_CAMPAIGN,
      status: LeadStatus.NEGOTIATION,
      value: 18000,
      notes: "Negociando desconto para contrato anual",
      tags: ["ecommerce", "marketing"],
    },
  ];

  for (const leadData of sampleLeads) {
    const existingLead = await prisma.lead.findFirst({
      where: {
        organizationId: adminOrg.id,
        email: leadData.email,
      },
    });

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          ...leadData,
          organizationId: adminOrg.id,
          assignedTo: adminUser.id,
        },
      });
    }
  }

  console.log(`✅ ${sampleLeads.length} sample leads created`);

  // Create sample submissions
  const sampleSubmissions = [
    {
      formType: "contact",
      data: {
        name: "Roberto Almeida",
        email: "roberto@email.com",
        phone: "+55 11 98888-7777",
        message: "Gostaria de saber mais sobre os planos disponíveis",
        subject: "Informações sobre planos",
      },
      status: SubmissionStatus.PENDING,
      source: "website",
      ipAddress: "192.168.1.100",
    },
    {
      formType: "lead",
      data: {
        name: "Fernanda Lima",
        email: "fernanda@empresa.com",
        phone: "+55 21 97777-6666",
        company: "Lima & Associados",
        interest: "Consultoria empresarial",
      },
      status: SubmissionStatus.REVIEWED,
      source: "landing-page",
      ipAddress: "192.168.1.101",
      notes: "Lead qualificado, enviar material comercial",
    },
    {
      formType: "support",
      data: {
        name: "Lucas Mendes",
        email: "lucas@cliente.com",
        subject: "Dúvida sobre integração",
        message: "Como integrar a API com nosso sistema legado?",
        priority: "medium",
      },
      status: SubmissionStatus.APPROVED,
      source: "portal",
      ipAddress: "192.168.1.102",
      notes: "Ticket criado #1234",
    },
    {
      formType: "contact",
      data: {
        name: "Juliana Rocha",
        email: "juliana@startup.io",
        message: "Interesse em parceria estratégica",
        subject: "Proposta de parceria",
      },
      status: SubmissionStatus.PENDING,
      source: "website",
      ipAddress: "192.168.1.103",
    },
    {
      formType: "lead",
      data: {
        name: "Marcos Vieira",
        email: "marcos@tech.com.br",
        phone: "+55 11 96666-5555",
        company: "Vieira Tech",
        interest: "Desenvolvimento de app mobile",
        budget: "50k-100k",
      },
      status: SubmissionStatus.REVIEWED,
      source: "google-ads",
      ipAddress: "192.168.1.104",
      notes: "Cliente com budget alto, priorizar contato",
    },
  ];

  for (const submissionData of sampleSubmissions) {
    await prisma.submission.create({
      data: {
        ...submissionData,
        organizationId: adminOrg.id,
        userId: adminUser.id,
      },
    });
  }

  console.log(`✅ ${sampleSubmissions.length} sample submissions created`);

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
