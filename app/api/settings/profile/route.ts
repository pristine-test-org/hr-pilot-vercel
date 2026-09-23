import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, toSafeUser } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().trim().email("Please provide a valid email address."),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { email: parsed.data.email, NOT: { id: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "That email address is already in use." }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name, email: parsed.data.email },
    });

    return NextResponse.json({ user: toSafeUser(updated) });
  } catch (error) {
    return apiError(error);
  }
}
