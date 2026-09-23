import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

const createClaimSchema = z.object({
  category: z.enum(["FOOD", "TRAVEL", "MEDICAL", "OTHER"]),
  amount: z.number().positive().max(100000),
  description: z.string().trim().min(3, "Please provide a short description.").max(500),
  date: z.string(),
});

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");

    if (scope === "all" && user.role === "ADMIN") {
      const claims = await prisma.claim.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, department: true, jobTitle: true } },
        },
      });
      return NextResponse.json({ claims });
    }

    const claims = await prisma.claim.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ claims });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = createClaimSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const date = new Date(parsed.data.date);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Please provide a valid date." }, { status: 400 });
    }

    const claim = await prisma.claim.create({
      data: {
        userId: user.id,
        category: parsed.data.category,
        amount: parsed.data.amount,
        description: parsed.data.description,
        date,
        status: "PENDING",
      },
    });

    return NextResponse.json({ claim }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
