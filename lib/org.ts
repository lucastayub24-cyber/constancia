import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function activeOrganization() {
  const user = await requireUser();
  let membership = user.activeOrganizationId
    ? await db.membership.findUnique({ where: { organizationId_userId: { organizationId: user.activeOrganizationId, userId: user.id } }, include: { organization: true } })
    : null;

  if (!membership) {
    membership = await db.membership.findFirst({
      where: { userId: user.id },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      include: { organization: true },
    });
  }
  if (!membership) throw new Error("NO_ORGANIZATION");
  if (user.activeOrganizationId !== membership.organizationId) {
    await db.user.update({ where: { id: user.id }, data: { activeOrganizationId: membership.organizationId } });
  }
  return { user, membership, organization: membership.organization };
}

export async function requireOrgRole(roles: ("OWNER"|"ADMIN"|"MEMBER")[]) {
  const ctx = await activeOrganization();
  if (!roles.includes(ctx.membership.role)) throw new Error("FORBIDDEN");
  return ctx;
}
