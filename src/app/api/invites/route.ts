import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInviteSchema } from "@/lib/validations";
import { sendInviteEmail } from "@/lib/email";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    // Get organizations where user is admin
    const adminOrgs = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
            role: "ADMIN",
          },
        },
      },
      select: { id: true },
    });

    const orgIds = adminOrgs.map((org) => org.id);

    const invites = await prisma.invite.findMany({
      where: {
        organizationId: {
          in: orgIds,
        },
      },
      include: {
        organization: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Get invites error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const result = createInviteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, role, organizationId } = result.data;

    // Check if user is admin of the organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: user.id,
        organizationId,
        role: "ADMIN",
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Voce nao tem permissao para convidar membros" },
        { status: 403 }
      );
    }

    // Check if email is already a member
    const existingMember = await prisma.member.findFirst({
      where: {
        organizationId,
        user: {
          email,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Este email ja e membro da organizacao" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invite
    const existingInvite = await prisma.invite.findFirst({
      where: {
        email,
        organizationId,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "Ja existe um convite pendente para este email" },
        { status: 400 }
      );
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organizacao nao encontrada" },
        { status: 404 }
      );
    }

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        email,
        role,
        organizationId,
        senderId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        organization: true,
      },
    });

    // Send invite email
    await sendInviteEmail(
      email,
      sender?.name || "Um membro",
      organization.name,
      invite.token
    );

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    console.error("Create invite error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
