import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

const decisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = decisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const existing = await prisma.claim.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    const claim = await prisma.claim.update({
      where: { id },
      data: {
        status: parsed.data.status,
        decidedById: admin.id,
        decidedAt: new Date(),
      },
    });

    return NextResponse.json({ claim });
  } catch (error) {
    return apiError(error);
  }
}
