import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

const createLeaveSchema = z.object({
  type: z.enum(["ANNUAL", "SICK", "UNPAID"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().trim().min(3, "Please provide a short reason.").max(500),
});

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");

    if (scope === "all" && user.role === "ADMIN") {
      const leaves = await prisma.leaveRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, department: true, jobTitle: true } },
        },
      });
      return NextResponse.json({ leaves });
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ leaves });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = createLeaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { type, reason } = parsed.data;
    const startDate = new Date(parsed.data.startDate);
    const endDate = new Date(parsed.data.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Please provide valid dates." }, { status: 400 });
    }
    if (endDate < startDate) {
      return NextResponse.json({ error: "End date must be on or after the start date." }, { status: 400 });
    }

    const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: user.id,
        type,
        startDate,
        endDate,
        days,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({ leave }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
