import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");

    if (scope === "all" && user.role === "ADMIN") {
      const payslips = await prisma.payslip.findMany({
        orderBy: [{ month: "desc" }],
        include: {
          user: { select: { id: true, name: true, department: true, jobTitle: true } },
        },
      });
      return NextResponse.json({ payslips });
    }

    const payslips = await prisma.payslip.findMany({
      where: { userId: user.id },
      orderBy: { month: "desc" },
    });
    return NextResponse.json({ payslips });
  } catch (error) {
    return apiError(error);
  }
}
