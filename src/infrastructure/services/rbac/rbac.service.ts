import { prisma } from "@/infrastructure/prisma/client";
import { getCurrentUser } from "@/infrastructure/services/auth/auth.service";
import type { Role } from "@prisma/client";

export type Permission =
  | "organization:read"
  | "organization:update"
  | "organization:delete"
  | "member:read"
  | "member:invite"
  | "member:remove"
  | "member:update-role"
  | "billing:read"
  | "billing:update"
  | "settings:read"
  | "settings:update"
  | "integration:read"
  | "integration:create"
  | "integration:update"
  | "integration:delete"
  | "apikey:read"
  | "apikey:create"
  | "apikey:update"
  | "apikey:delete"
  | "submission:read"
  | "submission:create"
  | "submission:update"
  | "submission:delete"
  | "lead:read"
  | "lead:create"
  | "lead:update"
  | "lead:delete";

// Define permissions for each role
const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    "organization:read",
    "organization:update",
    "organization:delete",
    "member:read",
    "member:invite",
    "member:remove",
    "member:update-role",
    "billing:read",
    "billing:update",
    "settings:read",
    "settings:update",
    "integration:read",
    "integration:create",
    "integration:update",
    "integration:delete",
    "apikey:read",
    "apikey:create",
    "apikey:update",
    "apikey:delete",
    "submission:read",
    "submission:create",
    "submission:update",
    "submission:delete",
    "lead:read",
    "lead:create",
    "lead:update",
    "lead:delete",
  ],
  MEMBER: [
    "organization:read",
    "member:read",
    "settings:read",
    "integration:read",
  ],
};

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Get all permissions for a role
export function getPermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

// Get user's role in an organization
export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<Role | null> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId,
    },
  });

  return member?.role ?? null;
}

// Check if user has permission in an organization
export async function checkPermission(
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId);
  if (!role) return false;
  return hasPermission(role, permission);
}

// Check if current user has permission (for use in API routes)
export async function requirePermission(
  organizationId: string,
  permission: Permission
): Promise<{ allowed: boolean; user: { id: string } | null; role: Role | null }> {
  const user = await getCurrentUser();
  if (!user) {
    return { allowed: false, user: null, role: null };
  }

  const role = await getUserRole(user.id, organizationId);
  if (!role) {
    return { allowed: false, user, role: null };
  }

  const allowed = hasPermission(role, permission);
  return { allowed, user, role };
}

// Guard for API routes
export async function guardOrganization(
  organizationId: string,
  permission: Permission
): Promise<
  | { success: true; userId: string; role: Role }
  | { success: false; error: string; status: number }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Nao autenticado", status: 401 };
  }

  const role = await getUserRole(user.id, organizationId);
  if (!role) {
    return { success: false, error: "Voce nao e membro desta organizacao", status: 403 };
  }

  if (!hasPermission(role, permission)) {
    return { success: false, error: "Voce nao tem permissao para esta acao", status: 403 };
  }

  return { success: true, userId: user.id, role };
}

// Check if user is admin of organization
export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId);
  return role === "ADMIN";
}

// Get user's organizations with their roles
export async function getUserOrganizations(userId: string) {
  return prisma.member.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          _count: {
            select: {
              members: true,
            },
          },
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
  });
}
