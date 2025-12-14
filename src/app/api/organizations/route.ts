import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { prisma } from "@/infrastructure/prisma/client";
import { createOrganizationSchema } from '@/application/validators/schemas';
import { generateSlug } from '@/shared/utils/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Get organizations error:", error);
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
    const result = createOrganizationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, slug } = result.data;
    const finalSlug = slug || generateSlug(name);

    // Check if slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: finalSlug },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "Este slug ja esta em uso" },
        { status: 400 }
      );
    }

    // Get free plan
    const freePlan = await prisma.plan.findFirst({
      where: { slug: "free" },
    });

    // Create organization with user as admin
    const organization = await prisma.organization.create({
      data: {
        name,
        slug: finalSlug,
        members: {
          create: {
            userId: user.id,
            role: "ADMIN",
          },
        },
        subscription: freePlan
          ? {
              create: {
                planId: freePlan.id,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ),
              },
            }
          : undefined,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    console.error("Create organization error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
