import { prisma } from "@/lib/prisma";

export type LeaveBalance = {
  annual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
};

export async function getLeaveBalance(
  userId: string,
  annualLeaveDays: number,
  sickLeaveDays: number
): Promise<LeaveBalance> {
  const approved = await prisma.leaveRequest.findMany({
    where: { userId, status: "APPROVED" },
    select: { type: true, days: true },
  });

  const usedAnnual = approved
    .filter((leave) => leave.type === "ANNUAL")
    .reduce((sum, leave) => sum + leave.days, 0);
  const usedSick = approved
    .filter((leave) => leave.type === "SICK")
    .reduce((sum, leave) => sum + leave.days, 0);

  return {
    annual: {
      total: annualLeaveDays,
      used: usedAnnual,
      remaining: Math.max(annualLeaveDays - usedAnnual, 0),
    },
    sick: {
      total: sickLeaveDays,
      used: usedSick,
      remaining: Math.max(sickLeaveDays - usedSick, 0),
    },
  };
}
